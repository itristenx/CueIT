// src/lib/db/index.ts
// Unified database manager coordinating PostgreSQL, MongoDB, and Elasticsearch
import enhancedPrisma from './postgres.js';
import enhancedMongo from './mongo.js';
import { elasticManager } from './elastic.js';
import { logger } from '../../../nova-api/logger.js';

// Database health status interface
interface DatabaseHealth {
  postgres: {
    healthy: boolean;
    responseTime?: number;
    error?: string;
  };
  mongo: {
    healthy: boolean;
    responseTime?: number;
    error?: string;
  };
  elasticsearch: {
    healthy: boolean;
    responseTime?: number;
    clusterStatus?: string;
    error?: string;
  };
}

// Nova Database Manager - coordinates all database operations
class NovaDatabaseManager {
  private initialized = false;

  constructor() {
    // Graceful shutdown handler
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  async initialize() {
    if (this.initialized) return;

    logger.info('Initializing Nova Database Manager...');

    try {
      // Initialize all database connections in parallel
      await Promise.all([
        Promise.resolve(), // Prisma client is already initialized
        enhancedMongo.getDb(),
        elasticManager.initialize()
      ]);

      this.initialized = true;
      logger.info('Nova Database Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Nova Database Manager:', error);
      throw error;
    }
  }

  // Get comprehensive health status of all databases
  async getHealthStatus(): Promise<DatabaseHealth> {
    const [postgresHealth, mongoHealth, elasticHealth] = await Promise.allSettled([
      enhancedPrisma.healthCheck(),
      enhancedMongo.healthCheck(),
      elasticManager.healthCheck()
    ]);

    return {
      postgres: postgresHealth.status === 'fulfilled' 
        ? postgresHealth.value 
        : { healthy: false, error: postgresHealth.reason?.message },
      mongo: mongoHealth.status === 'fulfilled'
        ? mongoHealth.value
        : { healthy: false, error: mongoHealth.reason?.message },
      elasticsearch: elasticHealth.status === 'fulfilled'
        ? elasticHealth.value
        : { healthy: false, error: elasticHealth.reason?.message }
    };
  }

  // User management operations (PostgreSQL primary, with audit logging to MongoDB)
  async createUser(userData: any) {
    try {
      await this.ensureInitialized();

      // Create user in PostgreSQL
      const user = await enhancedPrisma.prisma.user.create({ data: userData });

      // Log user creation to MongoDB
      await enhancedMongo.logUserActivity(
        user.id,
        'user_created',
        { userId: user.id, email: user.email }
      );

      // Also log as audit entry
      await enhancedMongo.logAudit(
        user.id,
        'user_created',
        { email: user.email },
        userData.ip
      );

      logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to create user',
        'database_manager',
        error as Error,
        { userData }
      );
      throw error;
    }
  }

  async updateUser(userId: string, updateData: any, auditInfo: any) {
    try {
      await this.ensureInitialized();

      // Update user in PostgreSQL
      const user = await enhancedPrisma.prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Log update to MongoDB
      await enhancedMongo.logUserActivity(
        userId,
        'user_updated',
        { changes: updateData }
      );

      // Audit log
      await enhancedMongo.logAudit(
        userId,
        'user_updated',
        { changes: updateData },
        auditInfo.ip
      );

      return user;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to update user',
        'database_manager',
        error as Error,
        { userId, updateData }
      );
      throw error;
    }
  }

  // Ticket management with full-text search indexing
  async createTicket(ticketData: any) {
    try {
      await this.ensureInitialized();

      // Create ticket in PostgreSQL (first check if supportTicket model exists)
      let ticket;
      try {
        ticket = await enhancedPrisma.prisma.supportTicket.create({ 
          data: ticketData,
          include: {
            user: true,
            assignee: true
          }
        });
      } catch (error: any) {
        // If supportTicket model doesn't exist, create a generic ticket record
        if (error.message.includes('Unknown model')) {
          logger.warn('SupportTicket model not found, creating basic ticket record');
          // For now, just log the ticket creation
          await enhancedMongo.logSystem(
            'info',
            'Ticket created (no PostgreSQL model)',
            'database_manager',
            ticketData
          );
          
          // Create a mock ticket for indexing
          ticket = {
            id: `ticket_${Date.now()}`,
            ...ticketData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } else {
          throw error;
        }
      }

      // Index ticket in Elasticsearch for search
      await elasticManager.indexTicket({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        assigneeId: ticket.assigneeId,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      });

      // Log ticket creation
      await enhancedMongo.logUserActivity(
        ticket.userId,
        'ticket_created',
        { ticketId: ticket.id, title: ticket.title }
      );

      logger.info(`Ticket created: ${ticket.id}`);
      return ticket;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to create ticket',
        'database_manager',
        error as Error,
        { ticketData }
      );
      throw error;
    }
  }

  async updateTicket(ticketId: string, updateData: any, userId: string) {
    try {
      await this.ensureInitialized();

      // Update ticket in PostgreSQL
      let ticket;
      try {
        ticket = await enhancedPrisma.prisma.supportTicket.update({
          where: { id: ticketId },
          data: updateData,
          include: {
            user: true,
            assignee: true
          }
        });
      } catch (error: any) {
        if (error.message.includes('Unknown model')) {
          logger.warn('SupportTicket model not found, logging update only');
          await enhancedMongo.logSystem(
            'info',
            'Ticket updated (no PostgreSQL model)',
            'database_manager',
            { ticketId, updateData }
          );
          
          // Create mock updated ticket
          ticket = {
            id: ticketId,
            ...updateData,
            updatedAt: new Date()
          };
        } else {
          throw error;
        }
      }

      // Re-index ticket in Elasticsearch
      await elasticManager.indexTicket({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        assigneeId: ticket.assigneeId,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      });

      // Log ticket update
      await enhancedMongo.logUserActivity(
        userId,
        'ticket_updated',
        { ticketId, changes: updateData }
      );

      return ticket;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to update ticket',
        'database_manager',
        error as Error,
        { ticketId, updateData }
      );
      throw error;
    }
  }

  // Search tickets using Elasticsearch
  async searchTickets(query: string, filters: any = {}, options: any = {}) {
    try {
      await this.ensureInitialized();

      const startTime = Date.now();
      const results = await elasticManager.searchTickets(query, filters, options);
      const responseTime = Date.now() - startTime;

      // Log search activity
      await enhancedMongo.logSearch(
        query,
        filters.userId,
        results.hits.length,
        responseTime,
        { filters, options }
      );

      // Also log as API usage
      await enhancedMongo.logApiUsage(
        '/api/tickets/search',
        'GET',
        filters.userId,
        responseTime,
        { query, filters, resultsCount: results.hits.length }
      );

      return results;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to search tickets',
        'search',
        error as Error,
        { query, filters }
      );
      throw error;
    }
  }

  // Knowledge base management
  async createKbArticle(articleData: any) {
    try {
      await this.ensureInitialized();

      // Create article in PostgreSQL
      let article;
      try {
        article = await enhancedPrisma.prisma.knowledgeBaseArticle.create({ 
          data: articleData,
          include: {
            author: true
          }
        });
      } catch (error: any) {
        if (error.message.includes('Unknown model')) {
          logger.warn('KnowledgeBaseArticle model not found, creating basic article record');
          await enhancedMongo.logSystem(
            'info',
            'KB article created (no PostgreSQL model)',
            'database_manager',
            articleData
          );
          
          article = {
            id: `kb_${Date.now()}`,
            ...articleData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } else {
          throw error;
        }
      }

      // Index article in Elasticsearch
      await elasticManager.indexKbArticle({
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        category: article.category,
        tags: article.tags,
        authorId: article.authorId,
        visibility: article.visibility,
        status: article.status,
        version: article.version,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        viewCount: article.viewCount,
        rating: article.rating
      });

      // Log creation
      await enhancedMongo.logUserActivity(
        article.authorId,
        'kb_article_created',
        { articleId: article.id, title: article.title }
      );

      return article;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to create KB article',
        'database_manager',
        error as Error,
        { articleData }
      );
      throw error;
    }
  }

  // Search knowledge base
  async searchKnowledgeBase(query: string, filters: any = {}, options: any = {}) {
    try {
      await this.ensureInitialized();

      const startTime = Date.now();
      const results = await elasticManager.searchKnowledgeBase(query, filters, options);
      const responseTime = Date.now() - startTime;

      // Log search activity
      await enhancedMongo.logSearch(
        query,
        filters.userId,
        results.hits.length,
        responseTime,
        { type: 'knowledge_base', filters, options }
      );

      // API usage log
      await enhancedMongo.logApiUsage(
        '/api/kb/search',
        'GET',
        filters.userId,
        responseTime,
        { query, filters, resultsCount: results.hits.length }
      );

      return results;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to search knowledge base',
        'search',
        error as Error,
        { query, filters }
      );
      throw error;
    }
  }

  // System monitoring and analytics
  async getSystemMetrics(timeRange: string = '24h') {
    try {
      await this.ensureInitialized();

      const [
        dbHealth,
        searchAnalytics
      ] = await Promise.allSettled([
        this.getHealthStatus(),
        elasticManager.getSearchAnalytics(timeRange)
      ]);

      return {
        health: dbHealth.status === 'fulfilled' ? dbHealth.value : null,
        search: searchAnalytics.status === 'fulfilled' ? searchAnalytics.value : null,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      throw error;
    }
  }

  // Log application events
  async logEvent(eventData: any) {
    try {
      await enhancedMongo.logSystem(
        eventData.level || 'info',
        eventData.message,
        eventData.source || 'nova-universe',
        eventData.details || {}
      );

      // Also index important events in Elasticsearch for search
      if (eventData.level === 'error' || eventData.level === 'warn') {
        await elasticManager.indexLog(eventData);
      }
    } catch (error) {
      logger.error('Error logging event:', error);
      // Don't throw for logging errors
    }
  }

  // Data export for backup/analysis
  async exportData(options: { 
    includeUsers?: boolean;
    includeTickets?: boolean;
    includeKb?: boolean;
    includeLogs?: boolean;
    timeRange?: string;
  } = {}) {
    try {
      await this.ensureInitialized();

      const exportData: any = {
        exportedAt: new Date(),
        metadata: {
          version: '1.0',
          options
        }
      };

      if (options.includeUsers) {
        try {
          exportData.users = await enhancedPrisma.prisma.user.findMany({
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
              updatedAt: true
            }
          });
        } catch (error: any) {
          if (error.message.includes('Unknown model')) {
            logger.warn('User model not found, skipping users export');
            exportData.users = [];
          } else {
            throw error;
          }
        }
      }

      if (options.includeTickets) {
        try {
          exportData.tickets = await enhancedPrisma.prisma.supportTicket.findMany({
            include: {
              user: { select: { id: true, email: true } },
              assignee: { select: { id: true, email: true } }
            }
          });
        } catch (error: any) {
          if (error.message.includes('Unknown model')) {
            logger.warn('SupportTicket model not found, skipping tickets export');
            exportData.tickets = [];
          } else {
            throw error;
          }
        }
      }

      if (options.includeKb) {
        try {
          exportData.knowledgeBase = await enhancedPrisma.prisma.knowledgeBaseArticle.findMany({
            include: {
              author: { select: { id: true, email: true } }
            }
          });
        } catch (error: any) {
          if (error.message.includes('Unknown model')) {
            logger.warn('KnowledgeBaseArticle model not found, skipping KB export');
            exportData.knowledgeBase = [];
          } else {
            throw error;
          }
        }
      }

      // Log export activity
      await this.logEvent({
        level: 'info',
        message: 'Data export completed',
        source: 'database_manager',
        details: { options, recordCounts: Object.keys(exportData).length }
      });

      return exportData;
    } catch (error) {
      await this.logEvent({
        level: 'error',
        message: 'Data export failed',
        source: 'database_manager',
        error: error as Error
      });
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Graceful shutdown
  private async gracefulShutdown() {
    logger.info('Shutting down Nova Database Manager...');

    try {
      await Promise.all([
        enhancedPrisma.disconnect(),
        enhancedMongo.close(),
        elasticManager.close()
      ]);

      logger.info('Nova Database Manager shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database shutdown:', error);
      process.exit(1);
    }
  }
}

// Export singleton instance
export const novaDb = new NovaDatabaseManager();

// Export individual database managers for direct access when needed
export { default as postgres } from './postgres.js';
export { default as mongo } from './mongo.js';
export { elasticManager as elasticsearch } from './elastic.js';

// Export convenience methods
export const {
  initialize,
  getHealthStatus,
  createUser,
  updateUser,
  createTicket,
  updateTicket,
  searchTickets,
  createKbArticle,
  searchKnowledgeBase,
  getSystemMetrics,
  logEvent,
  exportData
} = novaDb;

export default novaDb;

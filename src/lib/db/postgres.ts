// src/lib/db/postgres.ts
// Prisma client for PostgreSQL core data
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../nova-api/logger.js';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern to prevent multiple instances
let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prismaInstance = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prismaInstance = global.__prisma;
}

// Enhanced Prisma client with middleware and error handling
class EnhancedPrismaClient {
  private client: PrismaClient;

  constructor() {
    this.client = prismaInstance;
    this.setupMiddleware();
  }

  private setupMiddleware() {
    // Query logging middleware
    this.client.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      
      if (process.env.DEBUG_SQL === 'true') {
        logger.debug(`Prisma Query ${params.model}.${params.action} took ${after - before}ms`);
      }
      
      return result;
    });

    // Error handling middleware
    this.client.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error: any) {
        logger.error('Prisma operation failed:', {
          model: params.model,
          action: params.action,
          error: error.message
        });
        throw error;
      }
    });

    // Audit logging middleware for sensitive operations
    this.client.$use(async (params, next) => {
      const sensitiveModels = ['User', 'Role', 'Permission', 'UserRole', 'RolePermission'];
      const sensitiveActions = ['create', 'update', 'delete', 'upsert'];
      
      if (sensitiveModels.includes(params.model || '') && 
          sensitiveActions.includes(params.action)) {
        logger.info('Sensitive operation:', {
          model: params.model,
          action: params.action,
          args: JSON.stringify(params.args, null, 2)
        });
      }
      
      return await next(params);
    });
  }

  // Health check method
  async healthCheck() {
    const start = Date.now();
    
    try {
      await this.client.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        healthy: true,
        responseTime,
        database: 'postgresql',
        orm: 'prisma'
      };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message,
        responseTime: Date.now() - start,
        database: 'postgresql',
        orm: 'prisma'
      };
    }
  }

  // Transaction wrapper with enhanced error handling
  async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    try {
      return await this.client.$transaction(fn);
    } catch (error: any) {
      logger.error('Prisma transaction failed:', error);
      throw error;
    }
  }

  // Get the underlying Prisma client
  get prisma() {
    return this.client;
  }

  // Graceful disconnect
  async disconnect() {
    await this.client.$disconnect();
    logger.info('Prisma client disconnected');
  }
}

// Export singleton instance
export const prismaClient = new EnhancedPrismaClient();
export const prisma = prismaClient.prisma;

// Export for backward compatibility and direct access
export default prismaClient;

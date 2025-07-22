import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ConversationContext {
  userId: string;
  module: string;
  history: ConversationMessage[];
  lastUpdated: Date;
}

interface ConversationMessage {
  id: string;
  userId: string;
  module: string;
  message: string;
  response: string;
  actions: any[];
  timestamp: Date;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private conversationCache = new Map<string, ConversationContext>();
  private readonly MAX_HISTORY_LENGTH = 20;

  constructor(private readonly prisma: PrismaService) {}

  async getConversationContext(
    userId: string,
    module: string,
  ): Promise<ConversationContext> {
    const cacheKey = `${userId}:${module}`;

    // Check cache first
    if (this.conversationCache.has(cacheKey)) {
      const cached = this.conversationCache.get(cacheKey);
      // Return cached if it's recent (within 1 hour)
      if (cached && Date.now() - cached.lastUpdated.getTime() < 3600000) {
        return cached;
      }
    }

    // Load from database
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          userId,
          module,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: this.MAX_HISTORY_LENGTH,
      });

      const context: ConversationContext = {
        userId,
        module,
        history: conversations.map((conv) => ({
          id: conv.id,
          userId: conv.userId,
          module: conv.module,
          message: conv.message,
          response: conv.response,
          actions: Array.isArray(conv.actions)
            ? conv.actions
            : conv.actions
              ? [conv.actions]
              : [],
          timestamp: conv.timestamp,
        })),
        lastUpdated: new Date(),
      };

      // Cache the context
      this.conversationCache.set(cacheKey, context);

      return context;
    } catch (error) {
      this.logger.error(
        `Error loading conversation context: ${error.message}`,
        error.stack,
      );

      // Return empty context on error
      return {
        userId,
        module,
        history: [],
        lastUpdated: new Date(),
      };
    }
  }

  async storeConversation(
    userId: string,
    module: string,
    message: string,
    response: string,
    actions: any[] = [],
  ): Promise<void> {
    try {
      // Store in database
      await this.prisma.conversation.create({
        data: {
          userId,
          module,
          message,
          response,
          actions,
          timestamp: new Date(),
          topic: 'AI Conversation',
          messages: JSON.stringify([
            { role: 'user', content: message },
            { role: 'assistant', content: response },
          ]),
        },
      });

      // Update cache
      const cacheKey = `${userId}:${module}`;
      const context = this.conversationCache.get(cacheKey);

      if (context) {
        context.history.unshift({
          id: `temp-${Date.now()}`,
          userId,
          module,
          message,
          response,
          actions,
          timestamp: new Date(),
        });

        // Keep only recent history
        if (context.history.length > this.MAX_HISTORY_LENGTH) {
          context.history = context.history.slice(0, this.MAX_HISTORY_LENGTH);
        }

        context.lastUpdated = new Date();
        this.conversationCache.set(cacheKey, context);
      }

      this.logger.debug(
        `Stored conversation for user ${userId} in module ${module}`,
      );
    } catch (error) {
      this.logger.error(
        `Error storing conversation: ${error.message}`,
        error.stack,
      );
    }
  }

  async clearConversationHistory(
    userId: string,
    module?: string,
  ): Promise<void> {
    try {
      if (module) {
        await this.prisma.conversation.deleteMany({
          where: {
            userId,
            module,
          },
        });

        // Clear cache
        const cacheKey = `${userId}:${module}`;
        this.conversationCache.delete(cacheKey);
      } else {
        await this.prisma.conversation.deleteMany({
          where: {
            userId,
          },
        });

        // Clear all cache entries for this user
        for (const key of this.conversationCache.keys()) {
          if (key.startsWith(`${userId}:`)) {
            this.conversationCache.delete(key);
          }
        }
      }

      this.logger.debug(
        `Cleared conversation history for user ${userId}${module ? ` in module ${module}` : ''}`,
      );
    } catch (error) {
      this.logger.error(
        `Error clearing conversation history: ${error.message}`,
        error.stack,
      );
    }
  }

  async getUserMemoryStats(userId: string): Promise<any> {
    try {
      const stats = await this.prisma.conversation.groupBy({
        by: ['module'],
        where: {
          userId,
        },
        _count: {
          id: true,
        },
      });

      return {
        userId,
        totalConversations: stats.reduce(
          (sum, stat) => sum + stat._count.id,
          0,
        ),
        moduleStats: stats.map((stat) => ({
          module: stat.module,
          conversationCount: stat._count.id,
        })),
      };
    } catch (error: any) {
      this.logger.error(
        `Error getting user memory stats: ${error.message}`,
        error.stack,
      );
      return {
        userId,
        totalConversations: 0,
        moduleStats: [],
      };
    }
  }

  async cleanupOldConversations(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.conversation.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(
        `Cleaned up ${result.count} old conversations older than ${daysToKeep} days`,
      );

      // Clear cache to force reload
      this.conversationCache.clear();
    } catch (error: any) {
      this.logger.error(
        `Error cleaning up old conversations: ${error.message}`,
        error.stack,
      );
    }
  }
}

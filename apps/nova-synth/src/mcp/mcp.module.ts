import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { AiService } from './ai.service';
import { EnhancedAiService } from './enhanced-ai.service';
import { AiProviderManager } from './ai-provider-manager.service';
import { McpAiConnector } from './mcp-ai-connector.service';
import { AnalyticsService } from './analytics.service';
import { MetricsService } from './metrics.service';
import { MemoryService } from './memory.service';
import { ToolRegistryService } from './tool-registry.service';
import { EventRouterService } from './event-router.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { TicketsModule } from '../tickets/tickets.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    TicketsModule,
    KnowledgeBaseModule,
  ],
  controllers: [McpController],
  providers: [
    McpService,
    AiService,
    EnhancedAiService,
    AiProviderManager,
    McpAiConnector,
    AnalyticsService,
    MetricsService,
    MemoryService,
    ToolRegistryService,
    EventRouterService,
  ],
  exports: [
    McpService,
    AiService,
    EnhancedAiService,
    MemoryService,
    ToolRegistryService,
  ],
})
export class McpModule {}

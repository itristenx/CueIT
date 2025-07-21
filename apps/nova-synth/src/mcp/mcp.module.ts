import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { AiService } from './ai.service';
import { MemoryService } from './memory.service';
import { ToolRegistryService } from './tool-registry.service';
import { EventRouterService } from './event-router.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { TicketsModule } from '../tickets/tickets.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    TicketsModule,
    KnowledgeBaseModule,
  ],
  controllers: [McpController],
  providers: [
    McpService,
    AiService,
    MemoryService,
    ToolRegistryService,
    EventRouterService,
  ],
  exports: [McpService, AiService, MemoryService, ToolRegistryService],
})
export class McpModule {}

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface NovaEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

@Injectable()
export class EventRouterService {
  private readonly logger = new Logger(EventRouterService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async routeEvent(eventType: string, data: any, source: string = 'mcp'): Promise<void> {
    const event: NovaEvent = {
      type: eventType,
      data,
      timestamp: new Date(),
      source,
    };

    this.logger.debug(`Routing event: ${eventType} from ${source}`);

    try {
      // Emit the event to all listeners
      this.eventEmitter.emit(eventType, event);
      
      // Emit a generic 'nova.event' for global listeners
      this.eventEmitter.emit('nova.event', event);

      // Route specific events to appropriate handlers
      await this.handleSpecificEvents(event);
    } catch (error) {
      this.logger.error(`Error routing event ${eventType}: ${error.message}`, error.stack);
    }
  }

  private async handleSpecificEvents(event: NovaEvent): Promise<void> {
    switch (event.type) {
      case 'message_processed':
        await this.handleMessageProcessed(event);
        break;
      
      case 'ticket_created':
        await this.handleTicketCreated(event);
        break;
      
      case 'user_status_requested':
        await this.handleUserStatusRequested(event);
        break;
      
      case 'tool_executed':
        await this.handleToolExecuted(event);
        break;
      
      default:
        this.logger.debug(`No specific handler for event type: ${event.type}`);
    }
  }

  private async handleMessageProcessed(event: NovaEvent): Promise<void> {
    // Log AI interaction for analytics
    this.logger.debug(`AI message processed for user ${event.data.userId} in module ${event.data.module}`);
    
    // TODO: Send to analytics service
    // TODO: Update user engagement metrics
  }

  private async handleTicketCreated(event: NovaEvent): Promise<void> {
    // Handle ticket creation notifications
    this.logger.debug(`Ticket created: ${event.data.ticketId}`);
    
    // TODO: Send notifications to relevant technicians
    // TODO: Update ticket metrics
    // TODO: Trigger workflow automation
  }

  private async handleUserStatusRequested(event: NovaEvent): Promise<void> {
    // Handle user status requests
    this.logger.debug(`User status requested for ${event.data.userId}`);
    
    // TODO: Update user activity tracking
    // TODO: Calculate XP and badges
  }

  private async handleToolExecuted(event: NovaEvent): Promise<void> {
    // Handle tool execution tracking
    this.logger.debug(`Tool executed: ${event.data.toolName} by user ${event.data.userId}`);
    
    // TODO: Update tool usage analytics
    // TODO: Track user tool preferences
  }

  // Public methods for other services to emit events
  async emitTicketCreated(ticketId: string, userId: string, data: any): Promise<void> {
    await this.routeEvent('ticket_created', {
      ticketId,
      userId,
      ...data,
    });
  }

  async emitUserEngagement(userId: string, action: string, module: string, data: any = {}): Promise<void> {
    await this.routeEvent('user_engagement', {
      userId,
      action,
      module,
      ...data,
    });
  }

  async emitToolUsage(toolName: string, userId: string, success: boolean, data: any = {}): Promise<void> {
    await this.routeEvent('tool_executed', {
      toolName,
      userId,
      success,
      ...data,
    });
  }

  async emitSystemEvent(eventType: string, data: any): Promise<void> {
    await this.routeEvent(`system.${eventType}`, data, 'system');
  }
}

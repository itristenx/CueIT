import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, Priority, TicketType } from '../../generated/prisma';
import { NotificationsService } from '../notifications/notifications.service';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface WorkflowCondition {
  field: string; // e.g., 'priority', 'type', 'category', 'status', 'creator.department'
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than';
  value: any;
}

export interface WorkflowAction {
  type:
    | 'assign'
    | 'set_priority'
    | 'set_status'
    | 'add_tag'
    | 'remove_tag'
    | 'notify'
    | 'escalate'
    | 'create_task';
  parameters: Record<string, any>;
}

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Apply workflow rules to a ticket
   */
  async applyWorkflowRules(
    ticketId: string,
    trigger: 'created' | 'updated' | 'assigned' | 'commented',
  ): Promise<{
    rulesApplied: string[];
    actionsExecuted: WorkflowAction[];
  }> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const workflowRules = await this.getWorkflowRules();
    const rulesApplied: string[] = [];
    const actionsExecuted: WorkflowAction[] = [];

    // Sort rules by priority
    const sortedRules = workflowRules.sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const meetsConditions = this.evaluateConditions(rule.conditions, ticket);

      if (meetsConditions) {
        rulesApplied.push(rule.id);

        for (const action of rule.actions) {
          try {
            await this.executeAction(action, ticket);
            actionsExecuted.push(action);
          } catch (error) {
            console.error(
              `Failed to execute workflow action ${action.type}:`,
              error,
            );
          }
        }
      }
    }

    return {
      rulesApplied,
      actionsExecuted,
    };
  }

  /**
   * Get default workflow rules
   */
  private async getWorkflowRules(): Promise<WorkflowRule[]> {
    // In a real implementation, these would be stored in the database and configurable via UI
    return [
      {
        id: 'auto-assign-hr',
        name: 'Auto-assign HR tickets',
        description: 'Automatically assign HR tickets to HR department leads',
        enabled: true,
        priority: 1,
        conditions: [
          {
            field: 'type',
            operator: 'equals',
            value: 'HR',
          },
        ],
        actions: [
          {
            type: 'assign',
            parameters: {
              assigneeQuery: { department: 'HR', role: 'HR_ADMIN' },
              strategy: 'round_robin', // or 'least_busy' or 'specific_user'
            },
          },
          {
            type: 'notify',
            parameters: {
              type: 'assigned',
              template: 'hr-ticket-assigned',
            },
          },
        ],
      },
      {
        id: 'escalate-critical',
        name: 'Escalate urgent tickets',
        description: 'Immediately escalate urgent priority tickets',
        enabled: true,
        priority: 1,
        conditions: [
          {
            field: 'priority',
            operator: 'equals',
            value: 'URGENT',
          },
        ],
        actions: [
          {
            type: 'notify',
            parameters: {
              type: 'escalation',
              recipients: ['admin@company.com'],
              template: 'urgent-ticket-escalation',
            },
          },
          {
            type: 'add_tag',
            parameters: {
              tags: ['escalated', 'urgent'],
            },
          },
        ],
      },
      {
        id: 'auto-assign-ops',
        name: 'Auto-assign Operations tickets',
        description: 'Automatically assign operations and facilities tickets',
        enabled: true,
        priority: 2,
        conditions: [
          {
            field: 'type',
            operator: 'in',
            value: ['OP'],
          },
        ],
        actions: [
          {
            type: 'assign',
            parameters: {
              assigneeQuery: { department: 'Operations' },
              strategy: 'round_robin',
            },
          },
        ],
      },
      {
        id: 'set-default-priority',
        name: 'Set default priority for requests',
        description: 'Set medium priority for all requests without priority',
        enabled: true,
        priority: 10, // Lower priority rule
        conditions: [
          {
            field: 'type',
            operator: 'equals',
            value: 'REQ',
          },
          {
            field: 'priority',
            operator: 'equals',
            value: null,
          },
        ],
        actions: [
          {
            type: 'set_priority',
            parameters: {
              priority: 'MEDIUM',
            },
          },
        ],
      },
    ];
  }

  /**
   * Evaluate if ticket meets workflow conditions
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    ticket: any,
  ): boolean {
    return conditions.every((condition) => {
      const fieldValue = this.getFieldValue(condition.field, ticket);

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;

        case 'not_equals':
          return fieldValue !== condition.value;

        case 'contains':
          return String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());

        case 'not_contains':
          return !String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());

        case 'in':
          return (
            Array.isArray(condition.value) &&
            condition.value.includes(fieldValue)
          );

        case 'not_in':
          return (
            !Array.isArray(condition.value) ||
            !condition.value.includes(fieldValue)
          );

        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);

        case 'less_than':
          return Number(fieldValue) < Number(condition.value);

        default:
          return false;
      }
    });
  }

  /**
   * Get field value from ticket object
   */
  private getFieldValue(field: string, ticket: any): any {
    const parts = field.split('.');
    let value = ticket;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * Execute a workflow action
   */
  private async executeAction(
    action: WorkflowAction,
    ticket: any,
  ): Promise<void> {
    switch (action.type) {
      case 'assign':
        await this.executeAssignAction(action.parameters, ticket);
        break;

      case 'set_priority':
        await this.executeSetPriorityAction(action.parameters, ticket);
        break;

      case 'set_status':
        await this.executeSetStatusAction(action.parameters, ticket);
        break;

      case 'add_tag':
        await this.executeAddTagAction(action.parameters, ticket);
        break;

      case 'remove_tag':
        await this.executeRemoveTagAction(action.parameters, ticket);
        break;

      case 'notify':
        await this.executeNotifyAction(action.parameters, ticket);
        break;

      case 'escalate':
        await this.executeEscalateAction(action.parameters, ticket);
        break;

      default:
        console.warn(`Unknown workflow action type: ${action.type}`);
    }
  }

  /**
   * Execute assignment action
   */
  private async executeAssignAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    let assigneeId: string | null = null;

    if (parameters.assigneeId) {
      assigneeId = parameters.assigneeId;
    } else if (parameters.assigneeQuery) {
      // Find user based on query
      const user = await this.prisma.user.findFirst({
        where: parameters.assigneeQuery,
      });
      assigneeId = user?.id || null;
    }

    if (assigneeId) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { assigneeId },
      });
    }
  }

  /**
   * Execute set priority action
   */
  private async executeSetPriorityAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { priority: parameters.priority },
    });
  }

  /**
   * Execute set status action
   */
  private async executeSetStatusAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: parameters.status },
    });
  }

  /**
   * Execute add tag action
   */
  private async executeAddTagAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    const currentTags = ticket.tags || [];
    const newTags = [...new Set([...currentTags, ...parameters.tags])];

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { tags: newTags },
    });
  }

  /**
   * Execute remove tag action
   */
  private async executeRemoveTagAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    const currentTags = ticket.tags || [];
    const newTags = currentTags.filter(
      (tag: string) => !parameters.tags.includes(tag),
    );

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { tags: newTags },
    });
  }

  /**
   * Execute notify action
   */
  private async executeNotifyAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    if (parameters.type && ticket.creatorId) {
      await this.notificationsService.sendTicketNotification(
        parameters.type,
        ticket.id,
        ticket.creatorId,
        parameters.additionalData || {},
      );
    }
  }

  /**
   * Execute escalate action
   */
  private async executeEscalateAction(
    parameters: any,
    ticket: any,
  ): Promise<void> {
    // Mark ticket as escalated
    const currentMetadata = ticket.metadata || {};
    const metadata = {
      ...currentMetadata,
      escalated: true,
      escalatedAt: new Date(),
      escalationLevel: (currentMetadata.escalationLevel || 0) + 1,
    };

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        metadata,
        priority: parameters.newPriority || ticket.priority,
      },
    });

    // Notify escalation recipients
    if (parameters.recipients) {
      for (const recipient of parameters.recipients) {
        // In a real implementation, you'd send email notifications here
        console.log(`Escalating ticket ${ticket.ticketNumber} to ${recipient}`);
      }
    }
  }

  /**
   * Process automatic escalations for overdue tickets
   */
  async processEscalations(): Promise<{
    processed: number;
    escalated: string[];
  }> {
    const now = new Date();
    const overdueTickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
        slaBreachAt: {
          lte: now,
        },
      },
      include: {
        creator: true,
        assignee: true,
      },
    });

    const escalated: string[] = [];

    for (const ticket of overdueTickets) {
      const metadata: any = ticket.metadata || {};

      if (!metadata.escalated) {
        // First escalation
        await this.executeEscalateAction(
          {
            newPriority: this.getEscalatedPriority(ticket.priority),
            recipients: ['support-lead@company.com'],
          },
          ticket,
        );

        escalated.push(ticket.id);
      } else if (metadata.escalationLevel < 3) {
        // Further escalations
        const escalationLevel = metadata.escalationLevel + 1;
        const recipients = this.getEscalationRecipients(escalationLevel);

        await this.executeEscalateAction(
          {
            newPriority: this.getEscalatedPriority(ticket.priority),
            recipients,
          },
          ticket,
        );

        escalated.push(ticket.id);
      }
    }

    return {
      processed: overdueTickets.length,
      escalated,
    };
  }

  /**
   * Get escalated priority level
   */
  private getEscalatedPriority(currentPriority: Priority): Priority {
    const escalationMap: Record<Priority, Priority> = {
      LOW: 'MEDIUM',
      MEDIUM: 'HIGH',
      HIGH: 'URGENT',
      URGENT: 'URGENT', // Already at max
    };

    return escalationMap[currentPriority] || 'HIGH';
  }

  /**
   * Get escalation recipients by level
   */
  private getEscalationRecipients(level: number): string[] {
    const recipients: Record<number, string[]> = {
      1: ['support-lead@company.com'],
      2: ['support-manager@company.com', 'it-director@company.com'],
      3: ['cto@company.com', 'ceo@company.com'],
    };

    return recipients[level] || recipients[3];
  }
}

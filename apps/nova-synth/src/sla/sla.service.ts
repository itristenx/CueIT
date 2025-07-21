import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Priority, TicketType } from '../../generated/prisma';

export interface SLARule {
  id: string;
  name: string;
  priority: Priority[];
  type: TicketType[];
  category?: string[];
  resolutionTimeHours: number;
  responseTimeHours: number;
  escalationRules: EscalationRule[];
  isActive: boolean;
}

export interface EscalationRule {
  level: number;
  hoursAfterBreach: number;
  escalateTo: string; // user ID or role
  action: 'assign' | 'notify' | 'reassign';
}

@Injectable()
export class SlaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate SLA breach time for a ticket
   */
  async calculateSlaBreachTime(
    priority: Priority,
    type: TicketType,
    category?: string,
    createdAt: Date = new Date()
  ): Promise<Date | null> {
    // Default SLA rules (in hours)
    const defaultSlaRules: Record<string, { response: number; resolution: number }> = {
      'URGENT': { response: 1, resolution: 4 },
      'HIGH': { response: 2, resolution: 8 },
      'MEDIUM': { response: 4, resolution: 24 },
      'LOW': { response: 8, resolution: 72 },
    };

    // Type-specific adjustments
    const typeMultipliers: Record<string, number> = {
      'INC': 1.0,    // Incidents - standard
      'REQ': 1.5,    // Requests - longer
      'HR': 2.0,     // HR - much longer
      'OP': 1.2,     // Operations - slightly longer
      'TASK': 3.0,   // Tasks - longest
      'CR': 2.5,     // Change requests - long
      'PRB': 0.8,    // Problems - shorter (high priority)
    };

    const baseSla = defaultSlaRules[priority] || defaultSlaRules['MEDIUM'];
    const typeMultiplier = typeMultipliers[type] || 1.0;
    
    const resolutionHours = baseSla.resolution * typeMultiplier;
    
    // Calculate breach time (excluding weekends for now)
    const breachTime = new Date(createdAt);
    breachTime.setHours(breachTime.getHours() + resolutionHours);
    
    return breachTime;
  }

  /**
   * Check for SLA breaches and update tickets
   */
  async checkSlaBreaches(): Promise<{
    breached: number;
    nearBreach: number;
    updated: string[];
  }> {
    const now = new Date();
    const nearBreachWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Find tickets with SLA breach times
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER'],
        },
        slaBreachAt: {
          not: null,
        },
      },
      include: {
        creator: true,
        assignee: true,
      },
    });

    const breachedTickets = tickets.filter(t => t.slaBreachAt && t.slaBreachAt <= now);
    const nearBreachTickets = tickets.filter(t => 
      t.slaBreachAt && 
      t.slaBreachAt > now && 
      t.slaBreachAt <= nearBreachWindow
    );

    const updatedTickets: string[] = [];

    // Mark breached tickets
    for (const ticket of breachedTickets) {
      const metadata: any = ticket.metadata || {};
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          metadata: {
            ...metadata,
            slaBreached: true,
            slaBreachedAt: now,
          },
        },
      });

      updatedTickets.push(ticket.id);

      // Could send escalation notifications here
      console.log(`SLA BREACH: Ticket ${ticket.ticketNumber} has breached SLA`);
    }

    // Flag near-breach tickets
    for (const ticket of nearBreachTickets) {
      const metadata: any = ticket.metadata || {};
      if (!metadata.slaNearBreach) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            metadata: {
              ...metadata,
              slaNearBreach: true,
              slaNearBreachAt: now,
            },
          },
        });

        updatedTickets.push(ticket.id);
        console.log(`SLA WARNING: Ticket ${ticket.ticketNumber} is near SLA breach`);
      }
    }

    return {
      breached: breachedTickets.length,
      nearBreach: nearBreachTickets.length,
      updated: updatedTickets,
    };
  }

  /**
   * Get SLA status for a ticket
   */
  async getTicketSlaStatus(ticketId: string): Promise<{
    slaBreachAt: Date | null;
    isBreached: boolean;
    isNearBreach: boolean;
    timeRemaining: number | null; // hours
    breachPercentage: number; // 0-100
  }> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        slaBreachAt: true,
        createdAt: true,
        metadata: true,
        status: true,
      },
    });

    if (!ticket || !ticket.slaBreachAt) {
      return {
        slaBreachAt: null,
        isBreached: false,
        isNearBreach: false,
        timeRemaining: null,
        breachPercentage: 0,
      };
    }

    const now = new Date();
    const isBreached = ticket.slaBreachAt <= now;
    const nearBreachWindow = 2 * 60 * 60 * 1000; // 2 hours
    const isNearBreach = !isBreached && (ticket.slaBreachAt.getTime() - now.getTime()) <= nearBreachWindow;

    // Calculate time remaining
    const timeRemainingMs = ticket.slaBreachAt.getTime() - now.getTime();
    const timeRemaining = isBreached ? 0 : Math.max(0, timeRemainingMs / (1000 * 60 * 60));

    // Calculate breach percentage
    const totalSlaTime = ticket.slaBreachAt.getTime() - ticket.createdAt.getTime();
    const elapsedTime = now.getTime() - ticket.createdAt.getTime();
    const breachPercentage = Math.min(100, Math.max(0, (elapsedTime / totalSlaTime) * 100));

    return {
      slaBreachAt: ticket.slaBreachAt,
      isBreached,
      isNearBreach,
      timeRemaining,
      breachPercentage,
    };
  }

  /**
   * Update ticket SLA when priority or type changes
   */
  async updateTicketSla(ticketId: string, priority: Priority, type: TicketType, category?: string): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { createdAt: true },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const newSlaBreachAt = await this.calculateSlaBreachTime(priority, type, category, ticket.createdAt);

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        slaBreachAt: newSlaBreachAt,
      },
    });
  }

  /**
   * Get SLA statistics
   */
  async getSlaStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalTickets: number;
    breachedTickets: number;
    breachRate: number;
    avgResolutionTime: number; // hours
    onTimeTickets: number;
  }> {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        slaBreachAt: true,
        metadata: true,
        status: true,
      },
    });

    const totalTickets = tickets.length;
    const breachedTickets = tickets.filter(t => {
      const metadata = t.metadata as any || {};
      return metadata.slaBreached === true;
    }).length;

    const resolvedTickets = tickets.filter(t => t.resolvedAt);
    const avgResolutionTime = resolvedTickets.length > 0 
      ? resolvedTickets.reduce((sum, t) => {
          const resolutionTime = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + resolutionTime;
        }, 0) / resolvedTickets.length
      : 0;

    const onTimeTickets = resolvedTickets.filter(t => {
      if (!t.slaBreachAt || !t.resolvedAt) return false;
      return t.resolvedAt <= t.slaBreachAt;
    }).length;

    return {
      totalTickets,
      breachedTickets,
      breachRate: totalTickets > 0 ? (breachedTickets / totalTickets) * 100 : 0,
      avgResolutionTime,
      onTimeTickets,
    };
  }
}

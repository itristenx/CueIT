import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client'; // Adjust the import based on your project structure

@Injectable()
export class RecurringTicketService {
  private readonly logger = new Logger(RecurringTicketService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleRecurringTickets() {
    this.logger.debug('Checking for due recurring ticket rules...');
    const now = new Date();
    const recurringRules = await this.prisma.recurringTicketRule.findMany({
      where: {
        nextRunAt: {
          lte: now,
        },
        isActive: true,
      },
    });

    for (const rule of recurringRules) {
      // Create a ticket based on the rule
      await this.prisma.ticket.create({
        data: {
          title: rule.title,
          description: rule.description,
          assigneeId: rule.assigneeId,
          ticketNumber: `TICKET-${Date.now()}`, // Example ticket number generation
          creatorId: 'system', // Replace with actual creator ID if available
          createdAt: now,
        },
      });

      // Update the rule's lastRunAt and nextRunAt
      await this.prisma.recurringTicketRule.update({
        where: { id: rule.id },
        data: {
          lastRunAt: now,
          nextRunAt: new Date(now.getTime() + rule.interval), // Assuming interval is in milliseconds
        },
      });
    }
  }

  async createTicket(data: {
    title: string;
    description: string;
    category: string;
    creatorId: string;
  }) {
    const now = new Date();
    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        creatorId: data.creatorId,
        ticketNumber: `TICKET-${Date.now()}`,
        createdAt: now,
      },
    });
  }

  async searchTickets(query: string, status: TicketStatus, limit: number) {
    return this.prisma.ticket.findMany({
      where: {
        title: { contains: query },
        status,
      },
      take: limit,
    });
  }

  async getUserStatus(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        userXP: true,
      },
    });
  }
}

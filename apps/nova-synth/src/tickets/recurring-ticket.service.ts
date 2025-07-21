import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringTicketService {
  private readonly logger = new Logger(RecurringTicketService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleRecurringTickets() {
    this.logger.debug('Checking for due recurring ticket rules...');
    // TODO: Query for active RecurringTicketRule where nextRunAt <= now and isActive
    // TODO: For each, create a ticket and update lastRunAt/nextRunAt
  }
}

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringTicketService } from './recurring-ticket.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [RecurringTicketService, PrismaService],
})
export class RecurringTicketModule {}

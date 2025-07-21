import { Module, forwardRef } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { SlaModule } from '../sla/sla.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { RecurringTicketService } from './recurring-ticket.service';

@Module({
  imports: [
    PrismaModule, 
    SecurityModule, 
    SlaModule,
    forwardRef(() => WorkflowModule),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, RecurringTicketService],
  exports: [TicketsService],
})
export class TicketsModule {}

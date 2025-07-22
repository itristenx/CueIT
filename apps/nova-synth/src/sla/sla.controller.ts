import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SlaService } from './sla.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { Priority, TicketType } from '../../generated/prisma';

@ApiTags('sla')
@Controller('sla')
@UseGuards(ClerkAuthGuard)
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get('check-breaches')
  @ApiOperation({ summary: 'Check for SLA breaches and update tickets' })
  @ApiResponse({ status: 200, description: 'SLA breach check completed' })
  async checkSlaBreaches() {
    return this.slaService.checkSlaBreaches();
  }

  @Get('ticket/:id/status')
  @ApiOperation({ summary: 'Get SLA status for a specific ticket' })
  @ApiResponse({
    status: 200,
    description: 'SLA status retrieved successfully',
  })
  async getTicketSlaStatus(@Param('id') ticketId: string) {
    return this.slaService.getTicketSlaStatus(ticketId);
  }

  @Post('ticket/:id/update')
  @ApiOperation({
    summary: 'Update SLA for a ticket when priority/type changes',
  })
  @ApiResponse({ status: 200, description: 'SLA updated successfully' })
  async updateTicketSla(
    @Param('id') ticketId: string,
    @Body()
    data: {
      priority: Priority;
      type: TicketType;
      category?: string;
    },
  ) {
    await this.slaService.updateTicketSla(
      ticketId,
      data.priority,
      data.type,
      data.category,
    );
    return { message: 'SLA updated successfully' };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get SLA statistics' })
  @ApiResponse({
    status: 200,
    description: 'SLA statistics retrieved successfully',
  })
  async getSlaStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.slaService.getSlaStatistics(start, end);
  }

  @Post('calculate-breach-time')
  @ApiOperation({ summary: 'Calculate SLA breach time for given parameters' })
  @ApiResponse({ status: 200, description: 'SLA breach time calculated' })
  async calculateSlaBreachTime(
    @Body()
    data: {
      priority: Priority;
      type: TicketType;
      category?: string;
      createdAt?: string;
    },
  ) {
    const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    const breachTime = await this.slaService.calculateSlaBreachTime(
      data.priority,
      data.type,
      data.category,
      createdAt,
    );

    return {
      breachTime,
      createdAt,
      hoursUntilBreach: breachTime
        ? Math.max(
            0,
            (breachTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60),
          )
        : null,
    };
  }
}

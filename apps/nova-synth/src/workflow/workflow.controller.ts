import { Controller, Post, Param, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@ApiTags('workflow')
@Controller('workflow')
@UseGuards(ClerkAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('ticket/:id/apply')
  @ApiOperation({ summary: 'Apply workflow rules to a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Workflow rules applied successfully',
  })
  async applyWorkflowRules(
    @Param('id') ticketId: string,
    @Body()
    data: {
      trigger: 'created' | 'updated' | 'assigned' | 'commented';
    },
  ) {
    return this.workflowService.applyWorkflowRules(ticketId, data.trigger);
  }

  @Post('escalations/process')
  @ApiOperation({
    summary: 'Process automatic escalations for overdue tickets',
  })
  @ApiResponse({
    status: 200,
    description: 'Escalations processed successfully',
  })
  async processEscalations() {
    return this.workflowService.processEscalations();
  }
}

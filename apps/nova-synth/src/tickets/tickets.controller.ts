
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Version,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, CreateCommentDto } from './dto/ticket.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { TicketStatus, Priority, TicketType } from '../../generated/prisma';

@Controller('tickets')
@UseGuards(ClerkAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Cancel (undo) a ticket if within the undo window
   */
  @Patch(':id/undo')
  @Version('2')
  async undoTicketV2(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const result = await this.ticketsService.cancelTicket(id, user.sub);
    return {
      success: result.success,
      message: result.message,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  // --- Reassignment Lock Endpoints ---
  @Patch(':id/lock-reassignment')
  @Version('2')
  async lockReassignmentV2(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const ticket = await this.ticketsService.lockReassignment(id, user.sub);
    return {
      success: true,
      data: ticket,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/unlock-reassignment')
  @Version('2')
  async unlockReassignmentV2(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const ticket = await this.ticketsService.unlockReassignment(id, user.sub);
    return {
      success: true,
      data: ticket,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/lock-reassignment')
  async lockReassignment(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.ticketsService.lockReassignment(id, user.sub);
  }

  @Patch(':id/unlock-reassignment')
  async unlockReassignment(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.ticketsService.unlockReassignment(id, user.sub);
  }

  @Get()
  @Version('2')
  async findAll(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: TicketStatus,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const user = req.user;
    
    // Get user role and department from user metadata or database
    const userRole = user.role || 'end_user';
    const userDepartment = user.department;
    
    const result = await this.ticketsService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
      userRole,
      userDepartment
    );
    
    // Enhanced response format for v2
    return {
      success: true,
      data: result.tickets,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @Version('2')
  async getStatsV2(@Request() req) {
    const user = req.user;
    const stats = await this.ticketsService.getTicketStats();
    
    return {
      success: true,
      data: stats,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-tickets')
  @Version('2')
  async getMyTicketsV2(
    @Request() req,
    @Query('type') type: 'created' | 'assigned' = 'created',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const user = req.user;
    const tickets = await this.ticketsService.getMyTickets(user.sub, type);
    
    return {
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tickets.length,
      },
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Version('2')
  async findOneV2(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const ticket = await this.ticketsService.findOne(id);
    
    return {
      success: true,
      data: ticket,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @Version('2')
  async updateV2(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    const user = req.user;
    
    // Enhanced validation for v2
    if (updateTicketDto.title !== undefined && !updateTicketDto.title.trim()) {
      throw new Error('Title cannot be empty');
    }
    
    if (updateTicketDto.description !== undefined && !updateTicketDto.description.trim()) {
      throw new Error('Description cannot be empty');
    }
    
    const ticket = await this.ticketsService.update(id, updateTicketDto, user.sub);
    
    return {
      success: true,
      data: ticket,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @Version('2')
  async removeV2(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.ticketsService.remove(id);
    
    return {
      success: true,
      message: 'Ticket deleted successfully',
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/comments')
  @Version('2')
  async addCommentV2(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    const user = req.user;
    
    // Enhanced validation for v2
    if (!createCommentDto.content?.trim()) {
      throw new Error('Comment content is required and cannot be empty');
    }
    
    const comment = await this.ticketsService.addComment(id, createCommentDto, user.sub);
    
    return {
      success: true,
      data: comment,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  // V1 Legacy endpoints (deprecated)
  @Post()
  @Version('1')
  async createV1(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    const user = req.user;
    return this.ticketsService.create(createTicketDto, user.sub);
  }

  @Get()
  @Version('1')
  async findAllV1(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: TicketStatus,
  ) {
    return this.ticketsService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
    );
  }

  @Get('stats')
  async getStats() {
    return this.ticketsService.getTicketStats();
  }

  @Get('my-tickets')
  async getMyTickets(
    @Request() req,
    @Query('type') type: 'created' | 'assigned' = 'created',
  ) {
    const user = req.user;
    return this.ticketsService.getMyTickets(user.sub, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.ticketsService.update(id, updateTicketDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.ticketsService.addComment(id, createCommentDto, user.sub);
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.ticketsService.archive(id, user.sub);
  }

  @Patch(':id/unarchive')
  async unarchive(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.ticketsService.unarchive(id, user.sub);
  }

  @Get('export/:format')
  async exportTickets(
    @Param('format') format: 'csv' | 'pdf' | 'json',
    @Request() req,
    @Query('status') status?: TicketStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    const filters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      assigneeId,
      creatorId,
    };

    const result = await this.ticketsService.exportTickets(format, filters);
    
    // In a real implementation, you'd set appropriate headers and return the file
    return {
      message: 'Export generated successfully',
      filename: result.filename,
      contentType: result.contentType,
      data: result.data.length || result.data.split('\n').length,
    };
  }

  @Post(':id/merge')
  async mergeTickets(
    @Param('id') targetTicketId: string,
    @Body() data: { sourceTicketIds: string[] },
    @Request() req,
  ) {
    const user = req.user;
    return this.ticketsService.mergeTickets(targetTicketId, data.sourceTicketIds, user.sub);
  }

  @Post(':id/split')
  async splitTicket(
    @Param('id') originalTicketId: string,
    @Body() data: {
      newTicketData: {
        title: string;
        description: string;
        priority?: Priority;
        type?: TicketType;
        category?: string;
      };
      commentIdsToMove: string[];
    },
    @Request() req,
  ) {
    const user = req.user;
    return this.ticketsService.splitTicket(
      originalTicketId,
      data.newTicketData,
      data.commentIdsToMove,
      user.sub
    );
  }
}

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
import { TicketStatus } from '../../generated/prisma';

@Controller('tickets')
@UseGuards(ClerkAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // V2 Enhanced endpoints (default)
  @Post()
  @Version('2')
  async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    const user = req.user;
    const userIP = req.ip || req.connection.remoteAddress;
    
    // Enhanced validation and security for v2
    if (!createTicketDto.title?.trim()) {
      throw new Error('Title is required and cannot be empty');
    }
    
    if (!createTicketDto.description?.trim()) {
      throw new Error('Description is required and cannot be empty');
    }
    
    // Additional security checks
    const sanitizedDto = {
      ...createTicketDto,
      title: createTicketDto.title.trim(),
      description: createTicketDto.description.trim(),
    };
    
    const ticket = await this.ticketsService.create(sanitizedDto, user.sub, userIP);
    
    // Enhanced response format for v2
    return {
      success: true,
      data: ticket,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
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
}

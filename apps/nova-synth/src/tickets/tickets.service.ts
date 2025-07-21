import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, CreateCommentDto } from './dto/ticket.dto';
import { Ticket, TicketStatus } from '../../generated/prisma';
import { SpamFilterService } from '../security/spam-filter.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spamFilterService: SpamFilterService,
  ) {}

  async create(createTicketDto: CreateTicketDto, creatorId: string, userIP?: string): Promise<Ticket> {
    // Get user info for spam filtering
    const user = await this.prisma.user.findUnique({
      where: { id: creatorId },
      select: { email: true, clerkId: true }
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Check for spam
    const spamCheck = this.spamFilterService.checkTicketSpam({
      title: createTicketDto.title,
      description: createTicketDto.description,
      submitterEmail: user.email,
      submitterIP: userIP,
      submitterIdentifier: user.clerkId || creatorId,
    });

    if (!spamCheck.allowed) {
      throw new ForbiddenException(`Ticket creation blocked: ${spamCheck.reason}`);
    }

    // Generate ticket number
    const ticketCount = await this.prisma.ticket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

    // Add spam metadata if flagged
    const metadata = spamCheck.action === 'flag' ? {
      spamFlags: spamCheck.metadata.contentAnalysis.matchedPatterns,
      spamScore: spamCheck.metadata.contentAnalysis.spamScore,
      requiresReview: true,
    } : undefined;

    return this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        ticketNumber,
        creatorId,
        dueDate: createTicketDto.dueDate ? new Date(createTicketDto.dueDate) : undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        // If quarantined, set status to a special state
        status: spamCheck.action === 'quarantine' ? 'PENDING_CUSTOMER' : 'OPEN',
      },
      include: {
        creator: true,
        assignee: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    status?: TicketStatus,
    userRole?: string,
    userDepartment?: string
  ): Promise<{
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    let where: any = {};

    if (status) {
      where.status = status;
    }

    // Apply role-based filtering for HR/Ops queue isolation
    if (userRole === 'hr_admin') {
      where.OR = [
        { category: 'hr' },
        { tags: { has: 'hr' } },
        { creator: { department: 'HR' } },
      ];
    } else if (userRole === 'ops_admin') {
      where.OR = [
        { category: 'operations' },
        { category: 'facilities' },
        { tags: { hasSome: ['operations', 'facilities', 'ops'] } },
        { creator: { department: { in: ['Operations', 'Facilities'] } } },
      ];
    } else if (userRole === 'reporting_analyst') {
      // Reporting analysts see tickets scoped to their department
      if (userDepartment) {
        where.creator = { department: userDepartment };
      }
    } else if (userRole === 'end_user' || userRole === 'manager') {
      // End users and managers only see their own tickets
      where.creatorId = userRole; // This would need to be the actual user ID
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: true,
          assignee: true,
          comments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              author: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { tickets, total, page, limit };
  }

  async findOne(id: string): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
        comments: {
          include: {
            author: true,
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        workflowStates: {
          include: {
            user: true,
          },
          orderBy: { timestamp: 'desc' },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...updateTicketDto,
        dueDate: updateTicketDto.dueDate ? new Date(updateTicketDto.dueDate) : undefined,
      },
      include: {
        creator: true,
        assignee: true,
      },
    });

    // Create workflow state entry
    await this.prisma.workflowState.create({
      data: {
        ticketId: id,
        userId,
        state: 'UPDATED',
        metadata: updateTicketDto as any,
      },
    });

    return ticket;
  }

  async remove(id: string): Promise<Ticket> {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  async addComment(ticketId: string, createCommentDto: CreateCommentDto, authorId: string) {
    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        ticketId,
        authorId,
        isInternal: createCommentDto.isInternal || false,
      },
      include: {
        author: true,
      },
    });
  }

  async getMyTickets(userId: string, type: 'created' | 'assigned' = 'created'): Promise<Ticket[]> {
    const where = type === 'created' ? { creatorId: userId } : { assigneeId: userId };
    
    return this.prisma.ticket.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
        comments: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
      this.prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),
      this.prisma.ticket.count({ where: { status: TicketStatus.CLOSED } }),
    ]);

    return { total, open, inProgress, resolved, closed };
  }
}

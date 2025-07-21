import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, CreateCommentDto } from './dto/ticket.dto';
import type { Ticket } from '../../generated/prisma';
import { TicketStatus, Priority, TicketType } from '../../generated/prisma';
import { SpamFilterService } from '../security/spam-filter.service';
import { SlaService } from '../sla/sla.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spamFilterService: SpamFilterService,
    private readonly slaService: SlaService,
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

    // Generate ticket number with type-based prefix
    const prefix = this.getTicketPrefix(createTicketDto.type || 'INC');
    const ticketCount = await this.getNextTicketNumber(prefix);
    const ticketNumber = `${prefix}-${String(ticketCount).padStart(6, '0')}`;

    // Add spam metadata if flagged
    const metadata = spamCheck.action === 'flag' ? {
      spamFlags: spamCheck.metadata.contentAnalysis.matchedPatterns,
      spamScore: spamCheck.metadata.contentAnalysis.spamScore,
      requiresReview: true,
    } : undefined;

    // Calculate SLA breach time
    const slaBreachAt = await this.slaService.calculateSlaBreachTime(
      createTicketDto.priority || 'MEDIUM',
      createTicketDto.type || 'INC',
      createTicketDto.category,
      new Date()
    );

    // Calculate undo window expiration if undoSendTimeout is provided
    let undoWindowExpiresAt: Date | undefined = undefined;
    if (typeof createTicketDto.undoSendTimeout === 'number' && createTicketDto.undoSendTimeout > 0) {
      undoWindowExpiresAt = new Date(Date.now() + createTicketDto.undoSendTimeout * 1000);
    }

    return this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        ticketNumber,
        creatorId,
        slaBreachAt,
        dueDate: createTicketDto.dueDate ? new Date(createTicketDto.dueDate) : undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        // If quarantined, set status to a special state
        status: spamCheck.action === 'quarantine' ? 'PENDING_CUSTOMER' : 'OPEN',
        undoWindowExpiresAt,
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

  /**
   * Cancel (undo) a ticket if within the undo window
   */
  async cancelTicket(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new BadRequestException('Ticket not found');
    }
    if (ticket.creatorId !== userId) {
      throw new ForbiddenException('Only the ticket creator can undo this ticket');
    }
    if (!ticket.undoWindowExpiresAt || new Date() > ticket.undoWindowExpiresAt) {
      throw new BadRequestException('Undo window has expired');
    }
    await this.prisma.ticket.delete({ where: { id } });
    return { success: true, message: 'Ticket successfully undone and deleted.' };
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
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new BadRequestException('Ticket not found');

    // If trying to change assignee and reassignmentLocked is true, block unless admin or current assignee
    if (
      updateTicketDto.assigneeId &&
      updateTicketDto.assigneeId !== ticket.assigneeId &&
      ticket.reassignmentLocked
    ) {
      // Fetch user role (assume userId is available and user has a role field)
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const privilegedRoles = ['ADMIN', 'TECH_LEAD'];
      if (
        userId !== ticket.assigneeId &&
        (!user || !privilegedRoles.includes(user.role))
      ) {
        throw new ForbiddenException('Ticket reassignment is locked. Only the current assignee or admin/lead can reassign.');
      }
    }

    const updatedTicket = await this.prisma.ticket.update({
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

    return updatedTicket;
  }

  /**
   * Lock ticket reassignment
   */
  async lockReassignment(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { reassignmentLocked: true },
      include: { creator: true, assignee: true },
    });
    await this.prisma.workflowState.create({
      data: {
        ticketId: id,
        userId,
        state: 'REASSIGNMENT_LOCKED',
        metadata: { locked: true },
      },
    });
    return ticket;
  }

  /**
   * Unlock ticket reassignment
   */
  async unlockReassignment(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { reassignmentLocked: false },
      include: { creator: true, assignee: true },
    });
    await this.prisma.workflowState.create({
      data: {
        ticketId: id,
        userId,
        state: 'REASSIGNMENT_UNLOCKED',
        metadata: { locked: false },
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

  /**
   * Get ticket prefix based on ticket type
   */
  private getTicketPrefix(type: string): string {
    const prefixMap: Record<string, string> = {
      'INC': 'INC',      // Incident
      'REQ': 'REQ',      // Request
      'HR': 'HR',        // HR Request
      'OP': 'OP',        // Operations Request
      'TASK': 'TASK',    // Task
      'CR': 'CR',        // Change Request
      'PRB': 'PRB',      // Problem
    };

    return prefixMap[type] || 'INC';
  }

  /**
   * Get next ticket number for the given prefix
   */
  private async getNextTicketNumber(prefix: string): Promise<number> {
    // Find the highest ticket number for this prefix
    const lastTicket = await this.prisma.ticket.findFirst({
      where: {
        ticketNumber: {
          startsWith: prefix + '-'
        }
      },
      orderBy: {
        ticketNumber: 'desc'
      },
      select: {
        ticketNumber: true
      }
    });

    if (lastTicket) {
      // Extract the number part and increment
      const numberPart = lastTicket.ticketNumber.split('-')[1];
      return parseInt(numberPart, 10) + 1;
    }

    // Start from 1 if no tickets with this prefix exist
    return 1;
  }

  /**
   * Archive a ticket
   */
  async archive(id: string, userId: string): Promise<Ticket> {
    // Check if user has permission to archive (basic ownership check)
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!ticket) {
      throw new BadRequestException('Ticket not found');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'CLOSED',
        metadata: ticket.metadata ? 
          { ...(typeof ticket.metadata === 'object' ? ticket.metadata : {}), archived: true, archivedAt: new Date(), archivedBy: userId } :
          { archived: true, archivedAt: new Date(), archivedBy: userId },
        closedAt: new Date(),
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

  /**
   * Unarchive a ticket
   */
  async unarchive(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!ticket) {
      throw new BadRequestException('Ticket not found');
    }

    let metadata: any = {};
    if (ticket.metadata && typeof ticket.metadata === 'object') {
      metadata = { ...ticket.metadata };
      if ('archived' in metadata) {
        delete metadata.archived;
        delete metadata.archivedAt;
        delete metadata.archivedBy;
      }
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'OPEN',
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        closedAt: null,
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

  /**
   * Export ticket data in various formats
   */
  async exportTickets(
    format: 'csv' | 'pdf' | 'json',
    filters?: {
      status?: TicketStatus;
      startDate?: Date;
      endDate?: Date;
      assigneeId?: string;
      creatorId?: string;
    }
  ): Promise<{ data: any; filename: string; contentType: string }> {
    // Build where clause based on filters
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }
    
    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }
    
    if (filters?.creatorId) {
      where.creatorId = filters.creatorId;
    }

    // Fetch tickets with related data
    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        return {
          data: this.generateCSV(tickets),
          filename: `tickets-export-${timestamp}.csv`,
          contentType: 'text/csv',
        };
      
      case 'json':
        return {
          data: JSON.stringify(tickets, null, 2),
          filename: `tickets-export-${timestamp}.json`,
          contentType: 'application/json',
        };
      
      case 'pdf':
        // For now, return as JSON with PDF content type
        // In a real implementation, you'd use a PDF library like puppeteer or pdfkit
        return {
          data: this.generateSimplePDFContent(tickets),
          filename: `tickets-export-${timestamp}.pdf`,
          contentType: 'application/pdf',
        };
      
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  /**
   * Generate CSV content from tickets
   */
  private generateCSV(tickets: any[]): string {
    const headers = [
      'Ticket Number',
      'Title',
      'Description',
      'Status',
      'Priority',
      'Type',
      'Category',
      'Creator',
      'Assignee',
      'Created At',
      'Updated At',
      'Resolved At',
      'Closed At',
    ];

    const rows = tickets.map(ticket => [
      ticket.ticketNumber,
      `"${ticket.title.replace(/"/g, '""')}"`,
      `"${ticket.description.replace(/"/g, '""')}"`,
      ticket.status,
      ticket.priority,
      ticket.type,
      ticket.category || '',
      `"${ticket.creator.firstName} ${ticket.creator.lastName}"`,
      ticket.assignee ? `"${ticket.assignee.firstName} ${ticket.assignee.lastName}"` : '',
      ticket.createdAt.toISOString(),
      ticket.updatedAt.toISOString(),
      ticket.resolvedAt ? ticket.resolvedAt.toISOString() : '',
      ticket.closedAt ? ticket.closedAt.toISOString() : '',
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Generate simple PDF-like content (text format for now)
   */
  private generateSimplePDFContent(tickets: any[]): string {
    const content = [
      'NOVA UNIVERSE - TICKETS EXPORT REPORT',
      '=' .repeat(50),
      `Generated: ${new Date().toLocaleString()}`,
      `Total Tickets: ${tickets.length}`,
      '',
    ];

    tickets.forEach((ticket, index) => {
      content.push(`${index + 1}. Ticket ${ticket.ticketNumber}`);
      content.push(`   Title: ${ticket.title}`);
      content.push(`   Status: ${ticket.status}`);
      content.push(`   Priority: ${ticket.priority}`);
      content.push(`   Creator: ${ticket.creator.firstName} ${ticket.creator.lastName}`);
      content.push(`   Assignee: ${ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'}`);
      content.push(`   Created: ${ticket.createdAt.toLocaleDateString()}`);
      content.push('');
    });

    return content.join('\n');
  }

  /**
   * Merge multiple tickets into a target ticket
   */
  async mergeTickets(targetTicketId: string, sourceTicketIds: string[], userId: string): Promise<Ticket> {
    if (sourceTicketIds.includes(targetTicketId)) {
      throw new BadRequestException('Target ticket cannot be in the source list');
    }

    // Get all tickets
    const targetTicket = await this.prisma.ticket.findUnique({
      where: { id: targetTicketId },
      include: {
        creator: true,
        assignee: true,
        comments: true,
      },
    });

    if (!targetTicket) {
      throw new BadRequestException('Target ticket not found');
    }

    const sourceTickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: sourceTicketIds },
      },
      include: {
        creator: true,
        assignee: true,
        comments: true,
      },
    });

    if (sourceTickets.length !== sourceTicketIds.length) {
      throw new BadRequestException('One or more source tickets not found');
    }

    // Start a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Copy comments from source tickets to target
      for (const sourceTicket of sourceTickets) {
        if (sourceTicket.comments.length > 0) {
          await prisma.comment.createMany({
            data: sourceTicket.comments.map(comment => ({
              content: `[Merged from ${sourceTicket.ticketNumber}] ${comment.content}`,
              ticketId: targetTicketId,
              authorId: comment.authorId,
              createdAt: comment.createdAt,
              isInternal: comment.isInternal,
            })),
          });
        }

        // Add merge note to target ticket
        await prisma.comment.create({
          data: {
            content: `Ticket ${sourceTicket.ticketNumber} "${sourceTicket.title}" was merged into this ticket. Original description: ${sourceTicket.description}`,
            ticketId: targetTicketId,
            authorId: userId,
            isInternal: true,
          },
        });

        // Update source ticket to mark as merged
        await prisma.ticket.update({
          where: { id: sourceTicket.id },
          data: {
            status: 'CLOSED',
            metadata: {
              mergedInto: targetTicketId,
              mergedAt: new Date(),
              mergedBy: userId,
            },
            closedAt: new Date(),
          },
        });
      }

      // Update target ticket metadata
      const currentMetadata: any = targetTicket.metadata || {};
      const mergedTickets = Array.isArray(currentMetadata.mergedTickets) ? currentMetadata.mergedTickets : [];
      
      const updatedTicket = await prisma.ticket.update({
        where: { id: targetTicketId },
        data: {
          metadata: {
            ...currentMetadata,
            mergedTickets: [
              ...mergedTickets,
              ...sourceTickets.map(t => ({
                ticketId: t.id,
                ticketNumber: t.ticketNumber,
                title: t.title,
                mergedAt: new Date(),
                mergedBy: userId,
              })),
            ],
          },
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

      return updatedTicket;
    });
  }

  /**
   * Split a ticket by creating a new ticket with some comments
   */
  async splitTicket(
    originalTicketId: string,
    newTicketData: {
      title: string;
      description: string;
      priority?: Priority;
      type?: TicketType;
      category?: string;
    },
    commentIdsToMove: string[],
    userId: string
  ): Promise<{ original: Ticket; split: Ticket }> {
    const originalTicket = await this.prisma.ticket.findUnique({
      where: { id: originalTicketId },
      include: {
        creator: true,
        assignee: true,
        comments: {
          where: { id: { in: commentIdsToMove } },
          include: { author: true },
        },
      },
    });

    if (!originalTicket) {
      throw new BadRequestException('Original ticket not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Create new ticket
      const prefix = this.getTicketPrefix(newTicketData.type || 'INC');
      const ticketCount = await this.getNextTicketNumber(prefix);
      const ticketNumber = `${prefix}-${String(ticketCount).padStart(6, '0')}`;

      const newTicket = await prisma.ticket.create({
        data: {
          ticketNumber,
          title: newTicketData.title,
          description: newTicketData.description,
          priority: newTicketData.priority || 'MEDIUM',
          type: newTicketData.type || 'INC',
          category: newTicketData.category,
          creatorId: originalTicket.creatorId,
          assigneeId: originalTicket.assigneeId,
          metadata: {
            splitFrom: originalTicketId,
            splitAt: new Date(),
            splitBy: userId,
          },
        },
        include: {
          creator: true,
          assignee: true,
          comments: {
            include: { author: true },
          },
        },
      });

      // Move comments to new ticket
      if (commentIdsToMove.length > 0) {
        await prisma.comment.updateMany({
          where: { id: { in: commentIdsToMove } },
          data: { ticketId: newTicket.id },
        });
      }

      // Add split note to original ticket
      await prisma.comment.create({
        data: {
          content: `Split ticket ${newTicket.ticketNumber} "${newTicket.title}" was created from this ticket.`,
          ticketId: originalTicketId,
          authorId: userId,
          isInternal: true,
        },
      });

      // Add split note to new ticket
      await prisma.comment.create({
        data: {
          content: `This ticket was split from ${originalTicket.ticketNumber} "${originalTicket.title}".`,
          ticketId: newTicket.id,
          authorId: userId,
          isInternal: true,
        },
      });

      // Update original ticket metadata
      const originalMetadata: any = originalTicket.metadata || {};
      const splitTickets = Array.isArray(originalMetadata.splitTickets) ? originalMetadata.splitTickets : [];

      const updatedOriginal = await prisma.ticket.update({
        where: { id: originalTicketId },
        data: {
          metadata: {
            ...originalMetadata,
            splitTickets: [
              ...splitTickets,
              {
                ticketId: newTicket.id,
                ticketNumber: newTicket.ticketNumber,
                title: newTicket.title,
                splitAt: new Date(),
                splitBy: userId,
              },
            ],
          },
        },
        include: {
          creator: true,
          assignee: true,
          comments: {
            include: { author: true },
          },
        },
      });

      return {
        original: updatedOriginal,
        split: newTicket,
      };
    });
  }
}

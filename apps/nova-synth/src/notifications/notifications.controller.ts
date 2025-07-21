import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { NotificationType } from '../../generated/prisma';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findAll(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(@Request() req, @Body() createNotificationDto: {
    type: NotificationType;
    title: string;
    message: string;
    ticketId?: string;
  }) {
    const userId = req.user.sub;
    return this.notificationsService.create(userId, createNotificationDto);
  }

  @Post('ticket/:ticketId/send')
  @ApiOperation({ summary: 'Send email notification for a ticket' })
  @ApiResponse({ status: 200, description: 'Email notification sent successfully' })
  async sendTicketNotification(
    @Param('ticketId') ticketId: string,
    @Body() data: {
      type: string;
      userId: string;
      additionalData?: any;
    }
  ) {
    return this.notificationsService.sendTicketNotification(
      data.type,
      ticketId,
      data.userId,
      data.additionalData
    );
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Test email configuration' })
  @ApiResponse({ status: 200, description: 'Email test completed' })
  async testEmail() {
    const isConnected = await this.notificationsService.testEmailConnection();
    return { connected: isConnected };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    await this.notificationsService.delete(id, userId);
    return { message: 'Notification deleted' };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.getUnreadCount(userId);
  }
}

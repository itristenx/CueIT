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
import { NotificationsService } from './notifications.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { NotificationType } from '../../generated/prisma';

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.findAll(userId);
  }

  @Post()
  async create(@Request() req, @Body() createNotificationDto: {
    type: NotificationType;
    title: string;
    message: string;
    ticketId?: string;
  }) {
    const userId = req.user.sub;
    return this.notificationsService.create(userId, createNotificationDto);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    await this.notificationsService.delete(id, userId);
    return { message: 'Notification deleted' };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.getUnreadCount(userId);
  }
}

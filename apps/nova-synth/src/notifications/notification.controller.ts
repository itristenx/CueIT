import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService, NotificationData } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-email')
  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(@Body() notificationData: NotificationData) {
    return this.notificationService.sendEmailNotification(notificationData);
  }

  @Post('ticket/:ticketId/notify/:userId')
  @ApiOperation({ summary: 'Send ticket notification to user' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendTicketNotification(
    @Param('ticketId') ticketId: string,
    @Param('userId') userId: string,
    @Body() notificationData: { type: string; data?: any },
  ) {
    return this.notificationService.sendTicketNotification(
      notificationData.type,
      ticketId,
      userId,
      notificationData.data,
    );
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates() {
    // Return list of available templates
    const templateIds = ['ticket-created', 'ticket-updated', 'ticket-resolved'];
    const templates = await Promise.all(
      templateIds.map((id) => this.notificationService.getEmailTemplate(id)),
    );
    return templates.filter((template) => template !== null);
  }

  @Get('templates/:templateId')
  @ApiOperation({ summary: 'Get specific email template' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplate(@Param('templateId') templateId: string) {
    const template =
      await this.notificationService.getEmailTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @Body()
    templateData: {
      name: string;
      subject: string;
      htmlContent: string;
      textContent: string;
      variables: string[];
    },
  ) {
    return this.notificationService.createEmailTemplate(templateData);
  }

  @Get('test-connection')
  @ApiOperation({ summary: 'Test SMTP connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection() {
    const isConnected = await this.notificationService.testEmailConnection();
    return {
      connected: isConnected,
      message: isConnected
        ? 'SMTP connection successful'
        : 'SMTP connection failed',
    };
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async sendTestEmail(@Body() testData: { to: string; subject?: string }) {
    return this.notificationService.sendEmailNotification({
      to: testData.to,
      subject: testData.subject || 'Nova Universe Test Email',
      template: 'test',
      variables: {
        testMessage: 'This is a test email from Nova Universe',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

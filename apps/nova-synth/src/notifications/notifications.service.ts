import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '../../generated/prisma';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface NotificationData {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  // BASIC NOTIFICATION METHODS

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(userId: string, data: {
    type: NotificationType;
    title: string;
    message: string;
    ticketId?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        ticketId: data.ticketId
      }
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        id,
        userId 
      },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { 
        id,
        userId 
      }
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { 
        userId,
        read: false 
      }
    });
    return { count };
  }

  // EMAIL NOTIFICATION METHODS

  async sendTicketNotification(type: string, ticketId: string, userId: string, data: any = {}) {
    try {
      // Get ticket and user information
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          creator: true,
          assignee: true,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!ticket || !user) {
        throw new Error('Ticket or user not found');
      }

      // Create in-app notification
      await this.create(userId, {
        type: type.toUpperCase() as NotificationType,
        title: `Ticket ${ticket.ticketNumber} ${type}`,
        message: `Your ticket "${ticket.title}" has been ${type}`,
        ticketId: ticket.id,
      });

      // Get appropriate template
      const templateName = this.getTemplateForNotificationType(type);
      const template = await this.getEmailTemplate(templateName);

      if (!template) {
        console.warn(`Email template not found: ${templateName}`);
        return;
      }

      // Prepare template variables
      const variables = {
        userName: user.firstName + ' ' + user.lastName,
        userEmail: user.email,
        ticketNumber: ticket.ticketNumber,
        ticketTitle: ticket.title,
        ticketDescription: ticket.description,
        ticketStatus: ticket.status,
        ticketPriority: ticket.priority,
        ticketUrl: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/tickets/${ticket.id}`,
        assigneeName: ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned',
        createdAt: ticket.createdAt.toLocaleDateString(),
        ...data,
      };

      // Send email notification
      await this.sendEmailNotification({
        to: user.email,
        subject: this.replaceVariables(template.subject, variables),
        template: template.id,
        variables,
      });

    } catch (error) {
      console.error(`Failed to send ${type} notification:`, error);
      throw error;
    }
  }

  async sendEmailNotification(notificationData: NotificationData) {
    try {
      const template = await this.getEmailTemplate(notificationData.template);
      
      if (!template) {
        throw new Error(`Template not found: ${notificationData.template}`);
      }

      const htmlContent = this.replaceVariables(template.htmlContent, notificationData.variables);
      const textContent = this.replaceVariables(template.textContent, notificationData.variables);

      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'Nova Universe <noreply@nova-universe.com>'),
        to: notificationData.to,
        subject: notificationData.subject,
        html: htmlContent,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${notificationData.to}:`, result.messageId);

      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
    // For now, return default templates
    const defaultTemplates: Record<string, EmailTemplate> = {
      'ticket-created': {
        id: 'ticket-created',
        name: 'Ticket Created',
        subject: 'Ticket {{ticketNumber}} Created - {{ticketTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Ticket Created</h2>
            <p>Hello {{userName}},</p>
            <p>Your ticket has been successfully created and assigned the number <strong>{{ticketNumber}}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Ticket Details</h3>
              <p><strong>Title:</strong> {{ticketTitle}}</p>
              <p><strong>Priority:</strong> {{ticketPriority}}</p>
              <p><strong>Status:</strong> {{ticketStatus}}</p>
              <p><strong>Assigned to:</strong> {{assigneeName}}</p>
              <p><strong>Created:</strong> {{createdAt}}</p>
            </div>
            
            <p>You can track the progress of your ticket by <a href="{{ticketUrl}}" style="color: #1e40af;">clicking here</a>.</p>
            
            <p>Thank you for using Nova Universe!</p>
            <p>The Nova Support Team</p>
          </div>
        `,
        textContent: `Ticket Created

Hello {{userName}},

Your ticket has been successfully created and assigned the number {{ticketNumber}}.

Ticket Details:
- Title: {{ticketTitle}}
- Priority: {{ticketPriority}}
- Status: {{ticketStatus}}
- Assigned to: {{assigneeName}}
- Created: {{createdAt}}

You can track the progress of your ticket at: {{ticketUrl}}

Thank you for using Nova Universe!
The Nova Support Team`,
        variables: ['userName', 'ticketNumber', 'ticketTitle', 'ticketPriority', 'ticketStatus', 'assigneeName', 'createdAt', 'ticketUrl'],
      },
      'ticket-updated': {
        id: 'ticket-updated',
        name: 'Ticket Updated',
        subject: 'Ticket {{ticketNumber}} Updated - {{ticketTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Ticket Updated</h2>
            <p>Hello {{userName}},</p>
            <p>Your ticket <strong>{{ticketNumber}}</strong> has been updated.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Current Status</h3>
              <p><strong>Status:</strong> {{ticketStatus}}</p>
              <p><strong>Assigned to:</strong> {{assigneeName}}</p>
            </div>
            
            <p>You can view the full details by <a href="{{ticketUrl}}" style="color: #1e40af;">clicking here</a>.</p>
            
            <p>Thank you for using Nova Universe!</p>
            <p>The Nova Support Team</p>
          </div>
        `,
        textContent: `Ticket Updated

Hello {{userName}},

Your ticket {{ticketNumber}} has been updated.

Current Status:
- Status: {{ticketStatus}}
- Assigned to: {{assigneeName}}

You can view the full details at: {{ticketUrl}}

Thank you for using Nova Universe!
The Nova Support Team`,
        variables: ['userName', 'ticketNumber', 'ticketStatus', 'assigneeName', 'ticketUrl'],
      },
      'ticket-resolved': {
        id: 'ticket-resolved',
        name: 'Ticket Resolved',
        subject: 'Ticket {{ticketNumber}} Resolved - {{ticketTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Ticket Resolved</h2>
            <p>Hello {{userName}},</p>
            <p>Great news! Your ticket <strong>{{ticketNumber}}</strong> has been resolved.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #16a34a;">Resolution Details</h3>
              <p><strong>Resolved by:</strong> {{assigneeName}}</p>
            </div>
            
            <p>If you're satisfied with the resolution, the ticket will automatically close in 24 hours. If you need further assistance, please reply to this email or <a href="{{ticketUrl}}" style="color: #1e40af;">reopen the ticket</a>.</p>
            
            <p>Thank you for using Nova Universe!</p>
            <p>The Nova Support Team</p>
          </div>
        `,
        textContent: `Ticket Resolved

Hello {{userName}},

Great news! Your ticket {{ticketNumber}} has been resolved.

Resolution Details:
- Resolved by: {{assigneeName}}

If you're satisfied with the resolution, the ticket will automatically close in 24 hours. 
If you need further assistance, please reply to this email or reopen the ticket at: {{ticketUrl}}

Thank you for using Nova Universe!
The Nova Support Team`,
        variables: ['userName', 'ticketNumber', 'assigneeName', 'ticketUrl'],
      },
    };

    return defaultTemplates[templateId] || null;
  }

  private getTemplateForNotificationType(type: string): string {
    const templateMap: Record<string, string> = {
      'created': 'ticket-created',
      'updated': 'ticket-updated',
      'assigned': 'ticket-updated',
      'resolved': 'ticket-resolved',
      'closed': 'ticket-resolved',
      'comment-added': 'ticket-updated',
    };

    return templateMap[type] || 'ticket-updated';
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, String(value || ''));
    }

    return result;
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

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
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }


  // Centralized notification rules
  private notificationRules = {
    'ticket.created': {
      channels: ['email', 'realtime', 'slack'],
      template: 'ticket-created',
    },
    'ticket.updated': {
      channels: ['email', 'realtime'],
      template: 'ticket-updated',
    },
    // Add more rules as needed
  };

  private getNotificationRule(type: string) {
    return this.notificationRules[type] || null;
  }

  async sendTicketNotification(type: string, ticketId: string, userId: string, data: any = {}) {
    // Centralized notification logic
    const rule = this.getNotificationRule(type);
    if (!rule) {
      console.warn(`No notification rule for type: ${type}`);
      return;
    }
    // Get ticket and user information
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        creator: true,
        assignee: true,
      },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!ticket || !user) {
      throw new Error('Ticket or user not found');
    }
    // Prepare variables for template
    const variables = {
      userName: user.firstName + ' ' + user.lastName,
      userEmail: user.email,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      priority: ticket.priority,
      description: ticket.description,
      creator: `${ticket.creator.firstName} ${ticket.creator.lastName} (${ticket.creator.email})`,
      createdAt: ticket.createdAt.toISOString(),
    };
    // Send notifications via enabled channels
    if (rule.channels.includes('email')) {
      await this.emailService.sendTicketNotification({
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
      }, [user.email]);
    }
    if (rule.channels.includes('realtime')) {
      // TODO: Implement real-time notification (WebSocket/SSE)
    }
    if (rule.channels.includes('slack')) {
      // TODO: Implement Slack notification
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


  // Persistent CRUD for EmailTemplate
  async createEmailTemplate(templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const template = await this.prisma.emailTemplate.create({
      data: {
        ...templateData,
        variables: templateData.variables.join(','),
      },
    });
    return {
      ...template,
      variables: template.variables.split(','),
    };
  }

  async getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) return null;
    return {
      ...template,
      variables: template.variables.split(','),
    };
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | null> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { name },
    });
    if (!template) return null;
    return {
      ...template,
      variables: template.variables.split(','),
    };
  }

  async listEmailTemplates(): Promise<EmailTemplate[]> {
    const templates = await this.prisma.emailTemplate.findMany();
    return templates.map(t => ({ ...t, variables: t.variables.split(',') }));
  }

  async updateEmailTemplate(id: string, data: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>) {
    const template = await this.prisma.emailTemplate.update({
      where: { id },
      data: {
        ...data,
        ...(data.variables
          ? { variables: Array.isArray(data.variables) ? data.variables.join(',') : String(data.variables) }
          : {}),
      },
    });
    return {
      ...template,
      variables: template.variables.split(','),
    };
  }

  async deleteEmailTemplate(id: string) {
    return this.prisma.emailTemplate.delete({ where: { id } });
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

    // Handle conditional blocks (simple implementation)
    result = result.replace(/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs, (match, variable, content) => {
      return variables[variable] ? content : '';
    });

    return result;
  }

  private async logNotification(userId: string, ticketId: string, type: string, channel: string, recipient: string) {
    try {
      await this.prisma.notification.create({
        data: {
          type: type.toUpperCase() as any,
          title: `Ticket ${type}`,
          message: `Notification sent via ${channel} to ${recipient}`,
          userId,
          ticketId,
        },
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
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

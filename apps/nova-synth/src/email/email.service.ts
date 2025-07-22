import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';
import { NotificationsGateway } from '../notifications/notifications.gateway';

// Define explicit types for ticket and Prisma
interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  priority: string;
  description: string;
  creator: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mailerService: MailerService,
    private notificationsGateway: NotificationsGateway, // Inject gateway
  ) {}

  // Email domain allowlist (config/DB-driven)
  private allowedDomains: string[] = [];
  async loadAllowedDomains(): Promise<void> {
    try {
      const dbDomains = await this.prisma.configuration.findMany({
        where: { key: 'ALLOWED_EMAIL_DOMAINS' },
        select: { value: true },
      });
      if (
        Array.isArray(dbDomains) &&
        dbDomains.length > 0 &&
        typeof dbDomains[0].value === 'string'
      ) {
        this.allowedDomains = dbDomains[0].value.split(',');
        return;
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(
          'DB config fetch failed, falling back to config service:',
          e.message,
        );
      } else {
        console.warn(
          'DB config fetch failed, falling back to config service:',
          e,
        );
      }
    }
    const domains = this.config.get<string>('ALLOWED_EMAIL_DOMAINS');
    this.allowedDomains = domains
      ? domains.split(',')
      : ['company.com', 'nova.com'];
  }
  async isAllowedDomain(email: string): Promise<boolean> {
    if (!this.allowedDomains.length) await this.loadAllowedDomains();
    const domain = email.split('@')[1];
    return this.allowedDomains.includes(domain);
  }

  // Spam detection: hybrid (local + external API)
  private spamKeywords = ['buy now', 'free', 'click here'];
  private async isSpam(content: string): Promise<boolean> {
    const localSpam = this.spamKeywords.some((kw: string) => {
      return content.toLowerCase().includes(kw);
    });
    if (localSpam) return true;
    try {
      const fetchModule = (await import('node-fetch')) as {
        default: typeof import('node-fetch').default;
      };
      const fetch = fetchModule?.default;
      const apiKey = this.config.get<string>('SPAM_API_KEY');
      const apiUrl = this.config.get<string>('SPAM_API_URL');
      if (apiKey && apiUrl && typeof fetch === 'function') {
        const resp = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ text: content }),
        });
        if (resp && typeof resp.json === 'function') {
          const rawData: unknown = await resp.json();
          let isSpam = false;
          if (
            rawData &&
            typeof rawData === 'object' &&
            'spam' in rawData &&
            typeof (rawData as { spam?: unknown }).spam === 'boolean'
          ) {
            isSpam = (rawData as { spam: boolean }).spam;
          }
          return isSpam === true;
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn('External spam check failed:', e.message);
      } else {
        console.warn('External spam check failed:', e);
      }
    }
    return false;
  }

  // Real-time notification stub (to be implemented with WebSocket/SSE)

  // Stub: mark params as intentionally unused
  async sendRealtimeNotification(
    userId: string,
    message: string,
  ): Promise<{ success: boolean }> {
    try {
      await Promise.resolve(
        this.notificationsGateway.sendNotification(userId, { message }),
      );
      return { success: true };
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('WebSocket notification failed:', e.message);
      } else {
        console.error('WebSocket notification failed:', e);
      }
      return { success: false };
    }
  }

  // Slack integration stub

  async sendSlackNotification(
    channel: string,
    text: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const token = this.config.get<string>('SLACK_BOT_TOKEN');
      if (!token) throw new Error('Slack bot token not configured');
      const slack = new WebClient(token);
      const result = await slack.chat.postMessage({
        channel,
        text,
      });
      return { success: result.ok };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Slack notification failed:', err.message);
        return { success: false, error: err.message };
      } else {
        console.error('Slack notification failed:', err);
        return { success: false, error: String(err) };
      }
    }
  }

  async sendTicketNotification(
    ticket: Ticket,
    recipients: string[],
  ): Promise<{ success: boolean; error?: string }> {
    // Allowlist check
    for (const email of recipients) {
      if (!(await this.isAllowedDomain(email))) {
        // Mark ticket as reviewable (blocked by allowlist)
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'IN_PROGRESS',
          },
        });
        return { success: false, error: `Email domain not allowed: ${email}` };
      }
    }
    // Spam check
    if (await this.isSpam(ticket.description)) {
      // Mark ticket as reviewable (flagged as spam)
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'IN_PROGRESS',
        },
      });
      return { success: false, error: 'Ticket flagged as spam.' };
    }
    try {
      await this.mailerService.sendMail({
        to: recipients,
        from: this.config.get('SMTP_USER'),
        subject: `[Nova Ticket] ${ticket.title}`,
        template: 'ticket-created',
        context: {
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          priority: ticket.priority,
          description: ticket.description,
          creator: `${ticket.creator.firstName} ${ticket.creator.lastName} (${ticket.creator.email})`,
          createdAt: ticket.createdAt,
        },
      });
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Email send failed:', error.message);
        return { success: false, error: error.message };
      } else {
        console.error('Email send failed:', error);
        return { success: false, error: String(error) };
      }
    }
  }

  async testSMTPConnection() {
    try {
      // Use mailerService to verify connection
      // (MailerService does not expose verify, so fallback to Nodemailer for test only)
      const transporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST'),
        port: this.config.get('SMTP_PORT'),
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASS'),
        },
      });
      await transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('SMTP test failed:', error.message);
        return { success: false, error: error.message };
      } else {
        console.error('SMTP test failed:', error);
        return { success: false, error: String(error) };
      }
    }
  }

  async sendTestEmail(to: string, subject: string, message: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: this.config.get('SMTP_USER'),
        subject,
        html: message,
      });
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Test email send failed:', error.message);
        return { success: false, error: error.message };
      } else {
        console.error('Test email send failed:', error);
        return { success: false, error: String(error) };
      }
    }
  }
}

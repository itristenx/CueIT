import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

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
    private mailerService: MailerService
  ) {}

  // Email domain allowlist (config/DB-driven)
  private allowedDomains: string[] = [];
  async loadAllowedDomains(): Promise<void> {
    // TODO: Load from DB or config service; fallback to config for now
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
    // Local heuristic
    const localSpam = this.spamKeywords.some((kw: string) => {
      return content.toLowerCase().includes(kw);
    });
    if (localSpam) return true;
    // External API (stub: Akismet/SpamAssassin)
    try {
      // Use dynamic import for node-fetch
      const fetchModule = (await import('node-fetch')) as { default: typeof import('node-fetch').default };
      const fetch = fetchModule.default;
      const apiKey = this.config.get<string>('SPAM_API_KEY');
      const apiUrl = this.config.get<string>('SPAM_API_URL');
      if (apiKey && apiUrl) {
        const resp = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ text: content }),
        });
        const data: { spam?: boolean } = await resp.json();
        return data.spam === true;
      }
    } catch (e) {
      console.warn('External spam check failed:', e);
    }
    return false;
  }

  // Real-time notification stub (to be implemented with WebSocket/SSE)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Stub: mark params as intentionally unused
  async sendRealtimeNotification(_userId: string, _message: string): Promise<{ success: boolean }> {
    void _userId;
    void _message;
    // TODO: Implement WebSocket/SSE gateway emit
    return { success: true };
  }

  // Slack integration stub
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendSlackNotification(channel: string, text: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = this.config.get<string>('SLACK_BOT_TOKEN');
      if (!token) throw new Error('Slack bot token not configured');
      const slack = new WebClient(token);
      const result = await slack.chat.postMessage({
        channel,
        text,
      });
      return { success: result.ok };
    } catch (err: any) {
      console.error('Slack notification failed:', err);
      return { success: false, error: err.message };
    }
  }


  async sendTicketNotification(ticket: Ticket, recipients: string[]): Promise<{ success: boolean; error?: string }> {
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
    } catch (error) {
      console.error('Email send failed:', error);
      return { success: false, error: error.message };
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
    } catch (error) {
      console.error('SMTP test failed:', error);
      return { success: false, error: error.message };
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
    } catch (error) {
      console.error('Test email send failed:', error);
      return { success: false, error: error.message };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  async sendTicketNotification(ticket: any, recipients: string[]) {
    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });

    const mailOptions = {
      from: this.config.get('SMTP_USER'),
      to: recipients.join(', '),
      subject: `[CueIT Ticket] ${ticket.title}`,
      html: `
        <h2>New Ticket Created</h2>
        <p><strong>Ticket ID:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Description:</strong></p>
        <p>${ticket.description}</p>
        <p><strong>Created by:</strong> ${ticket.creator.firstName} ${ticket.creator.lastName} (${ticket.creator.email})</p>
        <p><strong>Created at:</strong> ${ticket.createdAt}</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testSMTPConnection() {
    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });

    try {
      await transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      console.error('SMTP test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestEmail(to: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });

    const mailOptions = {
      from: this.config.get('SMTP_USER'),
      to,
      subject,
      text: message,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Test email failed:', error);
      return { success: false, error: error.message };
    }
  }
}

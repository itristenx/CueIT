import { Controller, Post, Body, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() body: { to: string; subject: string; message: string },
  ) {
    return this.emailService.sendTestEmail(body.to, body.subject, body.message);
  }

  @Post('test-smtp')
  async testSMTP() {
    return this.emailService.testSMTPConnection();
  }

  @Get('test')
  async testConnection() {
    return this.emailService.testSMTPConnection();
  }
}

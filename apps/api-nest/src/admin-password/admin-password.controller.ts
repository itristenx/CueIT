import { Controller, Post, Put, Body, UseGuards } from '@nestjs/common';
import { AdminPasswordService } from './admin-password.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('api')
export class AdminPasswordController {
  constructor(private readonly adminPasswordService: AdminPasswordService) {}

  @Post('verify-password')
  @UseGuards(ClerkAuthGuard)
  async verifyPassword(@Body('password') password: string) {
    return this.adminPasswordService.verifyPassword(password);
  }

  @Put('admin-password')
  @UseGuards(ClerkAuthGuard)
  async updateAdminPassword(@Body('password') password: string) {
    return this.adminPasswordService.updateAdminPassword(password);
  }
}

import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SsoService } from './sso.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('api')
export class SsoController {
  constructor(private readonly ssoService: SsoService) {}

  @Get('sso-config')
  @UseGuards(ClerkAuthGuard)
  async getSsoConfig() {
    return this.ssoService.getSsoConfig();
  }

  @Put('sso-config')
  @UseGuards(ClerkAuthGuard)
  async updateSsoConfig(@Body() updates: any) {
    return this.ssoService.updateSsoConfig(updates);
  }

  @Get('sso-available')
  async getSsoAvailability() {
    return this.ssoService.getSsoAvailability();
  }
}

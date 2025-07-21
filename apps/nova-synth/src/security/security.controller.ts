import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('settings')
  async getAllSecuritySettings() {
    return this.securityService.getAllSecuritySettings();
  }

  @Get('settings/:key')
  async getSecuritySettingByKey(@Param('key') key: string) {
    return this.securityService.getSecuritySettingByKey(key);
  }

  @Post('settings')
  async createOrUpdateSecuritySetting(@Body() body: { key: string; value: string; encrypted?: boolean }) {
    return this.securityService.createOrUpdateSecuritySetting(body.key, body.value, body.encrypted);
  }

  @Delete('settings/:key')
  async deleteSecuritySetting(@Param('key') key: string) {
    return this.securityService.deleteSecuritySetting(key);
  }

  @Get('password-policy')
  async getPasswordPolicy() {
    return this.securityService.getPasswordPolicy();
  }

  @Put('password-policy')
  async updatePasswordPolicy(@Body() policy: any) {
    return this.securityService.updatePasswordPolicy(policy);
  }

  @Get('session-settings')
  async getSessionSettings() {
    return this.securityService.getSessionSettings();
  }

  @Put('session-settings')
  async updateSessionSettings(@Body() settings: any) {
    return this.securityService.updateSessionSettings(settings);
  }

  @Get('two-factor-settings')
  async getTwoFactorSettings() {
    return this.securityService.getTwoFactorSettings();
  }

  @Put('two-factor-settings')
  async updateTwoFactorSettings(@Body() settings: any) {
    return this.securityService.updateTwoFactorSettings(settings);
  }
}

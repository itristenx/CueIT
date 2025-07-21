import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller()
@UseGuards(ClerkAuthGuard)
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('config')
  async getConfig() {
    return this.configurationService.getConfiguration();
  }

  @Put('config')
  async updateConfig(@Body() updates: Record<string, any>) {
    return this.configurationService.updateConfiguration(updates);
  }

  @Get('status-config')
  async getStatusConfig() {
    return this.configurationService.getStatusConfig();
  }

  @Put('status-config')
  async updateStatusConfig(@Body() config: any) {
    return this.configurationService.updateStatusConfig(config);
  }

  @Get('directory-config')
  async getDirectoryConfig() {
    return this.configurationService.getDirectoryConfig();
  }

  @Put('directory-config')
  async updateDirectoryConfig(@Body() config: any) {
    return this.configurationService.updateDirectoryConfig(config);
  }
}

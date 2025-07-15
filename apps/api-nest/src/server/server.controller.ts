import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { ServerService } from './server.service';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get('info')
  async getServerInfo() {
    return this.serverService.getServerInfo();
  }

  @Put('info')
  async updateServerInfo(@Body() updateServerInfoDto: any) {
    return this.serverService.updateServerInfo(updateServerInfoDto);
  }

  @Get('health')
  async getHealthStatus() {
    return this.serverService.getHealthStatus();
  }

  @Post('maintenance')
  async setMaintenanceMode(@Body() body: { enabled: boolean; announcement?: string }) {
    return this.serverService.setMaintenanceMode(body.enabled, body.announcement);
  }

  @Get('stats')
  async getSystemStats() {
    return this.serverService.getSystemStats();
  }
}

@Controller('api')
export class ApiController {
  constructor(private readonly serverService: ServerService) {}

  @Get('health')
  async getHealth() {
    return this.serverService.getHealthStatus();
  }

  @Get('server-info')
  async getServerInfo() {
    return this.serverService.getServerInfo();
  }

  @Get('auth/status')
  async getAuthStatus() {
    return {
      authRequired: true,
      authDisabled: false,
      version: '2.0.0',
    };
  }
}

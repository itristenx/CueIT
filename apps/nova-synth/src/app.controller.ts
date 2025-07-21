import { Controller, Get, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { ServerService } from './server/server.service';
import { ConfigurationService } from './configuration/configuration.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly serverService: ServerService,
    private readonly configurationService: ConfigurationService
  ) {}

  @Get()
  getRoot(): object {
    return { status: 'API Running' };
  }

  @Get('health')
  getHealth(): object {
    return { status: 'running' };
  }

  // V1 Legacy endpoints for backward compatibility
  @Get('health')
  @Version('1')
  async getHealthV1() {
    return this.serverService.getHealthStatus();
  }

  @Get('server-info')
  @Version('1')
  async getServerInfoV1() {
    return this.serverService.getServerInfo();
  }

  @Get('auth/status')
  @Version('1')
  async getAuthStatusV1() {
    return {
      authRequired: true,
      authDisabled: false,
      version: '1.0.0',
      legacy: true,
    };
  }

  @Get('status-config')
  @Version('1')
  async getStatusConfigV1() {
    return this.configurationService.getStatusConfig();
  }

  // V2 Modern endpoints
  @Get('health')
  @Version('2')
  async getHealthV2() {
    return {
      ...await this.serverService.getHealthStatus(),
      version: '2.0.0',
      apiVersion: 'v2',
    };
  }

  @Get('server-info')
  @Version('2')
  async getServerInfoV2() {
    return {
      ...await this.serverService.getServerInfo(),
      version: '2.0.0',
      apiVersion: 'v2',
    };
  }

  @Get('auth/status')
  @Version('2')
  async getAuthStatusV2() {
    return {
      authRequired: true,
      authDisabled: false,
      version: '2.0.0',
      apiVersion: 'v2',
      features: {
        sso: true,
        scim: true,
        rbac: true,
        clerk: true,
      },
    };
  }

  @Get('status-config')
  @Version('2')
  async getStatusConfigV2() {
    return {
      ...await this.configurationService.getStatusConfig(),
      version: '2.0.0',
      apiVersion: 'v2',
    };
  }
}

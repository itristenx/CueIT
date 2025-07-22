import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NovaHelixService } from './nova-helix.service';
import { NovaIdService } from './nova-id.service';

@ApiTags('Nova Helix - Identity & Authentication')
@Controller('nova-helix')
export class NovaHelixController {
  constructor(
    private readonly novaHelixService: NovaHelixService,
    private readonly novaIdService: NovaIdService,
  ) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Authenticate user and return token' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  async login(@Body() loginData: { email: string; password: string }) {
    return this.novaHelixService.authenticateUser(
      loginData.email,
      loginData.password,
    );
  }

  @Post('nova-id/create')
  @ApiOperation({ summary: 'Create Nova ID for user' })
  @ApiResponse({ status: 201, description: 'Nova ID created successfully' })
  async createNovaId(
    @Body()
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      role?: string;
    },
  ) {
    return this.novaIdService.createNovaId(userData);
  }

  @Get('nova-id/:novaId/profile')
  @ApiOperation({ summary: 'Get Nova ID profile' })
  @ApiResponse({
    status: 200,
    description: 'Nova ID profile retrieved successfully',
  })
  async getNovaIdProfile(@Param('novaId') novaId: string) {
    return this.novaIdService.getNovaIdProfile(novaId);
  }

  @Post('nova-id/:novaId/xp')
  @ApiOperation({ summary: 'Update Nova Ascend progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  async updateProgress(
    @Param('novaId') novaId: string,
    @Body() progressData: { xpGained: number; stardustGained: number },
  ) {
    return this.novaIdService.updateNovaAscendProgress(
      novaId,
      progressData.xpGained,
      progressData.stardustGained,
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'nova-helix',
      timestamp: new Date().toISOString(),
    };
  }
}

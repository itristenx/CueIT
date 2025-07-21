import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { NovaIdService } from './nova-id.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Nova ID')
@Controller('nova-id')
@UseGuards(ClerkAuthGuard)
export class NovaIdController {
  constructor(private readonly novaIdService: NovaIdService) {}

  @Get('profile/:novaId')
  @ApiOperation({ summary: 'Get user profile by Nova ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('novaId') novaId: string) {
    return this.novaIdService.getUserProfile(novaId);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Get Nova ID directory' })
  @ApiResponse({ status: 200, description: 'Directory retrieved successfully' })
  async getDirectory() {
    return this.novaIdService.getDirectory();
  }

  @Post('link')
  @ApiOperation({ summary: 'Link external account to Nova ID' })
  @ApiResponse({ status: 200, description: 'Account linked successfully' })
  async linkAccount(@Body() linkData: { novaId: string; platform: string; externalId: string }) {
    return this.novaIdService.linkAccount(linkData);
  }

  @Get('gamification/:novaId')
  @ApiOperation({ summary: 'Get gamification stats for Nova ID' })
  @ApiResponse({ status: 200, description: 'Gamification stats retrieved successfully' })
  async getGamificationStats(@Param('novaId') novaId: string) {
    return this.novaIdService.getGamificationStats(novaId);
  }

  @Put('profile/:novaId')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Param('novaId') novaId: string, @Body() updateData: any) {
    return this.novaIdService.updateProfile(novaId, updateData);
  }
}

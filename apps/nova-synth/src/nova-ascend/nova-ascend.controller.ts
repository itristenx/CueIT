import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NovaAscendService } from './nova-ascend.service';

@ApiTags('Nova Ascend - Gamification')
@Controller('nova-ascend')
export class NovaAscendController {
  constructor(private readonly novaAscendService: NovaAscendService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get XP leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'XP leaderboard retrieved successfully',
  })
  async getLeaderboard(@Query('department') department?: string) {
    return this.novaAscendService.getLeaderboard(department);
  }

  @Get('user/:userId/profile')
  @ApiOperation({ summary: 'Get user gamification profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getUserProfile(@Param('userId') userId: string) {
    return this.novaAscendService.getNovaAscendProfile(userId);
  }

  @Post('user/:userId/xp')
  @ApiOperation({ summary: 'Award XP to user' })
  @ApiResponse({ status: 201, description: 'XP awarded successfully' })
  async awardXP(
    @Param('userId') userId: string,
    @Body() awardData: { action: string; amount?: number },
  ) {
    return this.novaAscendService.awardXP(
      userId,
      awardData.action,
      awardData.amount,
    );
  }

  @Post('user/:userId/badge')
  @ApiOperation({ summary: 'Award badge to user' })
  @ApiResponse({ status: 201, description: 'Badge awarded successfully' })
  async awardBadge(
    @Param('userId') userId: string,
    @Body() badgeData: { badgeName: string },
  ) {
    await this.novaAscendService.awardBadge(userId, badgeData.badgeName);
    return { message: 'Badge awarded successfully' };
  }
}

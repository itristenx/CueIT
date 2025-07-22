import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Nova Ascend - Gamification')
@Controller('gamification')
@UseGuards(ClerkAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('xp/:userId')
  @ApiOperation({ summary: 'Get user XP and gamification stats' })
  @ApiResponse({ status: 200, description: 'User XP retrieved successfully' })
  async getUserXP(@Param('userId') userId: string) {
    return this.gamificationService.getUserXP(userId);
  }

  @Post('xp/:userId/award')
  @ApiOperation({ summary: 'Award XP to user' })
  @ApiResponse({ status: 200, description: 'XP awarded successfully' })
  async awardXP(
    @Param('userId') userId: string,
    @Body() awardData: { amount: number; action: string; source?: string },
  ) {
    return this.gamificationService.awardXP(
      userId,
      awardData.amount,
      awardData.action,
      awardData.source,
    );
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get XP leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
  })
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @Post('initialize/:userId')
  @ApiOperation({ summary: 'Initialize user XP system' })
  @ApiResponse({ status: 200, description: 'User XP initialized successfully' })
  async initializeUserXP(@Param('userId') userId: string) {
    return this.gamificationService.initializeUserXP(userId);
  }
}

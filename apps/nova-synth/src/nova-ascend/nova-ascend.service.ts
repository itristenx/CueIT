import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NovaAscendProfile {
  userId: string;
  xpLevel: number;
  stardustPoints: number;
  rank: string;
  badges: string[];
  ticketsResolved: number;
  articlesWritten: number;
  feedbackSubmitted: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xpLevel: number;
  stardustPoints: number;
  rank: string;
  department?: string;
}

@Injectable()
export class NovaAscendService {
  constructor(private prisma: PrismaService) {}

  private readonly XP_THRESHOLDS = {
    ROOKIE: 0,
    SPECIALIST: 1000,
    COMMANDER: 5000,
    LEGEND: 15000,
  };

  private readonly XP_REWARDS = {
    TICKET_RESOLVED: 50,
    ARTICLE_WRITTEN: 100,
    FEEDBACK_SUBMITTED: 10,
    HELPFUL_VOTE: 5,
    KNOWLEDGE_SHARE: 25,
  };

  async awardXP(userId: string, action: string, amount?: number): Promise<NovaAscendProfile> {
    const xpAmount = amount || this.XP_REWARDS[action] || 0;
    const stardustAmount = Math.floor(xpAmount / 10);

    // Update user XP and stardust
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        // These fields would need to be added to the Prisma schema
        // xpLevel: { increment: xpAmount },
        // stardustPoints: { increment: stardustAmount },
      },
    });

    return this.getNovaAscendProfile(userId);
  }

  async getNovaAscendProfile(userId: string): Promise<NovaAscendProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Mock data since we don't have the fields in the schema yet
    const xpLevel = 1200; // This would be user.xpLevel
    const stardustPoints = 450; // This would be user.stardustPoints
    const rank = this.calculateRank(xpLevel);

    return {
      userId: user.id,
      xpLevel,
      stardustPoints,
      rank,
      badges: ['First Ticket', 'Helper', 'Knowledge Contributor'],
      ticketsResolved: 25,
      articlesWritten: 3,
      feedbackSubmitted: 12,
    };
  }

  async getLeaderboard(department?: string): Promise<LeaderboardEntry[]> {
    // This would query users ordered by XP level
    // For now, returning mock data
    return [
      {
        userId: 'user1',
        displayName: 'John Doe',
        xpLevel: 5500,
        stardustPoints: 1250,
        rank: 'Commander',
        department: 'IT',
      },
      {
        userId: 'user2',
        displayName: 'Jane Smith',
        xpLevel: 3200,
        stardustPoints: 890,
        rank: 'Specialist',
        department: 'IT',
      },
      {
        userId: 'user3',
        displayName: 'Bob Johnson',
        xpLevel: 1800,
        stardustPoints: 456,
        rank: 'Specialist',
        department: 'Operations',
      },
    ];
  }

  private calculateRank(xpLevel: number): string {
    if (xpLevel >= this.XP_THRESHOLDS.LEGEND) return 'Legend';
    if (xpLevel >= this.XP_THRESHOLDS.COMMANDER) return 'Commander';
    if (xpLevel >= this.XP_THRESHOLDS.SPECIALIST) return 'Specialist';
    return 'Rookie';
  }

  async awardBadge(userId: string, badgeName: string): Promise<void> {
    // Logic to award badges
    // This would update the user's badge collection
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserXP, XPTransaction } from '../../generated/prisma';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeUserXP(userId: string): Promise<UserXP> {
    const existingXP = await this.prisma.userXP.findUnique({
      where: { userId },
    });

    if (existingXP) {
      return existingXP;
    }

    return this.prisma.userXP.create({
      data: {
        userId,
        stardust: 0,
        level: 1,
        title: 'Cosmic Cadet',
        badges: [],
        streak: 0,
      },
    });
  }

  async awardXP(userId: string, amount: number, action: string, source?: string): Promise<UserXP> {
    const userXP = await this.prisma.userXP.findUnique({
      where: { userId },
    });

    if (!userXP) {
      throw new Error('User XP not found');
    }

    const newTotalXP = userXP.stardust + amount;
    const newLevel = this.calculateLevel(newTotalXP);

    // Create XP transaction
    await this.prisma.xPTransaction.create({
      data: {
        userId,
        userXpId: userXP.id,
        action,
        amount,
        source,
      },
    });

    // Update user XP
    const updatedXP = await this.prisma.userXP.update({
      where: { userId },
      data: {
        stardust: newTotalXP,
        level: newLevel,
        title: this.getTitleForLevel(newLevel),
        lastActionAt: new Date(),
      },
    });

    // Check for achievements
    await this.checkAchievements(userId);

    return updatedXP;
  }

  async getUserXP(userId: string): Promise<UserXP | null> {
    return this.prisma.userXP.findUnique({
      where: { userId },
      include: {
        xpTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async getLeaderboard(limit: number = 10): Promise<UserXP[]> {
    return this.prisma.userXP.findMany({
      orderBy: { stardust: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            novaId: true,
            displayName: true,
            profileImageUrl: true,
            department: true,
          },
        },
      },
    });
  }

  private calculateLevel(xp: number): number {
    // Level progression: 100 XP for level 1, 200 for level 2, etc.
    let level = 1;
    let requiredXP = 100;
    let totalXP = 0;

    while (totalXP + requiredXP <= xp) {
      totalXP += requiredXP;
      level++;
      requiredXP = level * 100;
    }

    return level;
  }

  private getTitleForLevel(level: number): string {
    const titles = [
      'Cosmic Cadet',
      'Stellar Technician',
      'Galactic Engineer',
      'Nebula Specialist',
      'Quantum Expert',
      'Cosmic Commander',
      'Nova Master',
      'Stellar Legend',
      'Galactic Hero',
      'Universe Guardian',
    ];

    const index = Math.min(Math.floor(level / 5), titles.length - 1);
    return titles[index];
  }

  private async checkAchievements(userId: string): Promise<void> {
    const userXP = await this.prisma.userXP.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            assignedTickets: true,
            createdTickets: true,
            ticketComments: true,
          },
        },
      },
    });

    if (!userXP) return;

    const badges = userXP.badges || [];
    const newBadges: string[] = [];

    // First Ticket Achievement
    if (userXP.user.assignedTickets.length >= 1 && !badges.includes('first_ticket')) {
      newBadges.push('first_ticket');
    }

    // Ticket Master Achievement
    if (userXP.user.assignedTickets.length >= 50 && !badges.includes('ticket_master')) {
      newBadges.push('ticket_master');
    }

    // Helpful Commenter Achievement
    if (userXP.user.ticketComments.length >= 100 && !badges.includes('helpful_commenter')) {
      newBadges.push('helpful_commenter');
    }

    // Level-based achievements
    if (userXP.level >= 10 && !badges.includes('level_10')) {
      newBadges.push('level_10');
    }

    if (userXP.level >= 25 && !badges.includes('level_25')) {
      newBadges.push('level_25');
    }

    if (userXP.level >= 50 && !badges.includes('level_50')) {
      newBadges.push('level_50');
    }

    // Update badges if any new ones were earned
    if (newBadges.length > 0) {
      await this.prisma.userXP.update({
        where: { userId },
        data: {
          badges: [...badges, ...newBadges],
        },
      });

      // Award XP for achievements
      for (const badge of newBadges) {
        await this.awardXP(userId, 50, `Badge earned: ${badge}`, 'achievements');
      }
    }
  }
}

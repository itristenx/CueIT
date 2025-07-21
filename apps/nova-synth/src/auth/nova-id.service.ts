import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserXP } from '../../generated/prisma';

@Injectable()
export class NovaIdService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(novaId: string): Promise<User & { userXP?: UserXP | null }> {
    const user = await this.prisma.user.findUnique({
      where: { novaId },
      include: {
        userXP: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with Nova ID ${novaId} not found`);
    }

    return user;
  }

  async getDirectory(): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
      select: {
        novaId: true,
        firstName: true,
        lastName: true,
        displayName: true,
        profileImageUrl: true,
        department: true,
        title: true,
        status: true,
        userXP: {
          select: {
            level: true,
            stardust: true,
            title: true,
          },
        },
      },
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        displayName: 'asc',
      },
    });
  }

  async linkAccount(linkData: { novaId: string; platform: string; externalId: string }): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { novaId: linkData.novaId },
    });

    if (!user) {
      throw new NotFoundException(`User with Nova ID ${linkData.novaId} not found`);
    }

    // Update user metadata with linked account
    const currentMetadata = user.metadata as any || {};
    const linkedAccounts = currentMetadata.linkedAccounts || {};
    linkedAccounts[linkData.platform] = linkData.externalId;

    return this.prisma.user.update({
      where: { novaId: linkData.novaId },
      data: {
        metadata: {
          ...currentMetadata,
          linkedAccounts,
        },
      },
    });
  }

  async getGamificationStats(novaId: string): Promise<UserXP | null> {
    const user = await this.prisma.user.findUnique({
      where: { novaId },
      include: {
        userXP: {
          include: {
            xpTransactions: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with Nova ID ${novaId} not found`);
    }

    return user.userXP;
  }

  async updateProfile(novaId: string, updateData: any): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { novaId },
    });

    if (!user) {
      throw new NotFoundException(`User with Nova ID ${novaId} not found`);
    }

    return this.prisma.user.update({
      where: { novaId },
      data: updateData,
    });
  }

  async generateNovaId(): Promise<string> {
    // Generate a unique Nova ID in format: NOVA-XXXX-XXXX
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'NOVA-';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      result += '-';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let novaId = generateId();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existingUser = await this.prisma.user.findUnique({
        where: { novaId },
      });

      if (!existingUser) {
        return novaId;
      }

      novaId = generateId();
      attempts++;
    }

    throw new Error('Failed to generate unique Nova ID');
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NovaIdUser {
  id: string;
  novaId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: string;
  department?: string;
  title?: string;
  xpLevel: number;
  stardustPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NovaIdService {
  constructor(private prisma: PrismaService) {}

  async createNovaId(userData: Partial<NovaIdUser>): Promise<string> {
    // Generate unique Nova ID
    const novaId = this.generateNovaId();
    
    // Create user with Nova ID
    await this.prisma.user.create({
      data: {
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        clerkId: userData.email || novaId, // Temporary mapping
        role: userData.role as any || 'END_USER',
        department: userData.department || null,
        title: userData.title || null,
      },
    });

    return novaId;
  }

  async getNovaIdProfile(novaId: string): Promise<NovaIdUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: novaId },
      include: {
        userXP: true, // Include XP data if available
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      novaId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || undefined,
      role: user.role,
      department: user.department || undefined,
      title: user.title || undefined,
      xpLevel: user.userXP?.level || 1,
      stardustPoints: user.userXP?.stardust || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateNovaAscendProgress(novaId: string, xpGained: number, stardustGained: number) {
    // Update XP in the UserXP table
    return await this.prisma.userXP.upsert({
      where: { userId: novaId },
      update: {
        stardust: {
          increment: stardustGained,
        },
        level: {
          increment: Math.floor(xpGained / 1000), // Level up every 1000 XP
        },
      },
      create: {
        userId: novaId,
        stardust: stardustGained,
        level: 1 + Math.floor(xpGained / 1000),
      },
    });
  }

  private generateNovaId(): string {
    // Generate unique Nova ID (UUID-like)
    return `novaid_${Math.random().toString(36).substr(2, 9)}`;
  }
}

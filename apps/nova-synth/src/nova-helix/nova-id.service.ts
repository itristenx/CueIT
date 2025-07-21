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
        ...userData,
        id: novaId,
        clerkId: userData.email, // Temporary mapping
      },
    });

    return novaId;
  }

  async getNovaIdProfile(novaId: string): Promise<NovaIdUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: novaId },
    });

    if (!user) return null;

    return {
      id: user.id,
      novaId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      role: user.role,
      department: user.department,
      title: user.title,
      xpLevel: user.xpLevel || 1,
      stardustPoints: user.stardustPoints || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateNovaAscendProgress(novaId: string, xpGained: number, stardustGained: number) {
    return await this.prisma.user.update({
      where: { id: novaId },
      data: {
        xpLevel: {
          increment: xpGained,
        },
        stardustPoints: {
          increment: stardustGained,
        },
      },
    });
  }

  private generateNovaId(): string {
    // Generate unique Nova ID (UUID-like)
    return `nova_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

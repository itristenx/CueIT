import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma';
import { NovaIdService } from './nova-id.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly novaIdService: NovaIdService,
  ) {}

  async findOrCreateUser(clerkUser: any): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
      return existingUser;
    }

    // Generate Nova ID for new user
    const novaId = await this.novaIdService.generateNovaId();

    // Create new user from Clerk data
    return this.prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        novaId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        displayName: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
        profileImageUrl: clerkUser.profileImageUrl,
      },
    });
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async getUserByNovaId(novaId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { novaId },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateUser(clerkUser: any): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
      return existingUser;
    }

    // Create new user from Clerk data
    return this.prisma.user.create({
      data: {
        clerkId: clerkUser.id,
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
}

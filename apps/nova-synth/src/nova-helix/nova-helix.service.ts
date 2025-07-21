import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NovaHelixService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async authenticateUser(email: string, password: string) {
    // Nova Helix authentication logic
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password (implement proper password hashing)
    // This is a simplified version
    const isValid = await this.verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      novaId: user.novaId 
    };

    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    };
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // Implement proper password verification
    // This is a placeholder
    return password === hashedPassword;
  }

  async validateNovaId(novaId: string) {
    return await this.prisma.user.findUnique({
      where: { novaId },
    });
  }
}

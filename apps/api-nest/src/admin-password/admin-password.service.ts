import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminPasswordService {
  constructor(private prisma: PrismaService) {}

  async verifyPassword(password: string): Promise<{ valid: boolean }> {
    // Get the admin password hash from configuration
    const config = await this.prisma.configuration.findUnique({
      where: { key: 'adminPassword' },
    });

    if (!config) {
      return { valid: false };
    }

    const isValid = await bcrypt.compare(password, config.value);
    return { valid: isValid };
  }

  async updateAdminPassword(password: string): Promise<{ message: string }> {
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the admin password in configuration
    await this.prisma.configuration.upsert({
      where: { key: 'adminPassword' },
      update: { value: hashedPassword },
      create: { key: 'adminPassword', value: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }
}

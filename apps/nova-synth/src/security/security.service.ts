import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  async getAllSecuritySettings() {
    return await this.prisma.securitySetting.findMany({
      orderBy: {
        key: 'asc',
      },
    });
  }

  async getSecuritySettingByKey(key: string) {
    return await this.prisma.securitySetting.findUnique({
      where: { key },
    });
  }

  async createOrUpdateSecuritySetting(
    key: string,
    value: string,
    encrypted: boolean = false,
  ) {
    let processedValue = value;
    if (encrypted) {
      processedValue = await bcrypt.hash(value, 12);
    }

    return await this.prisma.securitySetting.upsert({
      where: { key },
      update: {
        value: processedValue,
        encrypted,
      },
      create: {
        key,
        value: processedValue,
        encrypted,
      },
    });
  }

  async deleteSecuritySetting(key: string) {
    return await this.prisma.securitySetting.delete({
      where: { key },
    });
  }

  async getPasswordPolicy() {
    const settings = await this.prisma.securitySetting.findMany({
      where: {
        key: {
          in: [
            'password_min_length',
            'password_require_uppercase',
            'password_require_lowercase',
            'password_require_numbers',
            'password_require_symbols',
          ],
        },
      },
    });

    return settings.reduce((policy, setting) => {
      const key = setting.key.replace('password_', '');
      policy[key] =
        setting.value === 'true'
          ? true
          : setting.value === 'false'
            ? false
            : setting.value;
      return policy;
    }, {} as any);
  }

  async updatePasswordPolicy(policy: any) {
    const updates = Object.entries(policy).map(([key, value]) => ({
      key: `password_${key}`,
      value: String(value),
    }));

    const results: any[] = [];
    for (const update of updates) {
      const result = await this.createOrUpdateSecuritySetting(
        update.key,
        update.value,
      );
      results.push(result);
    }

    return results;
  }

  async getSessionSettings() {
    const settings = await this.prisma.securitySetting.findMany({
      where: {
        key: {
          in: [
            'session_timeout',
            'session_remember_me',
            'session_max_concurrent',
          ],
        },
      },
    });

    return settings.reduce((sessionSettings, setting) => {
      const key = setting.key.replace('session_', '');
      sessionSettings[key] =
        setting.value === 'true'
          ? true
          : setting.value === 'false'
            ? false
            : setting.value;
      return sessionSettings;
    }, {} as any);
  }

  async updateSessionSettings(settings: any) {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key: `session_${key}`,
      value: String(value),
    }));

    const results: any[] = [];
    for (const update of updates) {
      const result = await this.createOrUpdateSecuritySetting(
        update.key,
        update.value,
      );
      results.push(result);
    }

    return results;
  }

  async getTwoFactorSettings() {
    const settings = await this.prisma.securitySetting.findMany({
      where: {
        key: {
          in: [
            'two_factor_enabled',
            'two_factor_required',
            'two_factor_backup_codes',
          ],
        },
      },
    });

    return settings.reduce((twoFactorSettings, setting) => {
      const key = setting.key.replace('two_factor_', '');
      twoFactorSettings[key] =
        setting.value === 'true'
          ? true
          : setting.value === 'false'
            ? false
            : setting.value;
      return twoFactorSettings;
    }, {} as any);
  }

  async updateTwoFactorSettings(settings: any) {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key: `two_factor_${key}`,
      value: String(value),
    }));

    const results: any[] = [];
    for (const update of updates) {
      const result = await this.createOrUpdateSecuritySetting(
        update.key,
        update.value,
      );
      results.push(result);
    }

    return results;
  }
}

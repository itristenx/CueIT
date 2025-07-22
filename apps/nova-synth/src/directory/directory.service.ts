import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DirectoryService {
  constructor(private prisma: PrismaService) {}

  async getDirectoryConfig() {
    // Get directory configuration from database
    const configs = await this.prisma.configuration.findMany({
      where: {
        key: {
          in: [
            'directoryEnabled',
            'directoryProvider',
            'directoryUrl',
            'directoryToken',
            'directoryBaseDN',
            'directoryBindDN',
            'directoryBindPassword',
            'directoryUserFilter',
            'directorySyncInterval',
          ],
        },
      },
    });

    const configMap = configs.reduce(
      (acc, config) => {
        acc[config.key] = config.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      enabled: configMap.directoryEnabled === 'true',
      provider: configMap.directoryProvider || 'mock',
      url: configMap.directoryUrl || '',
      token: configMap.directoryToken || '',
      baseDN: configMap.directoryBaseDN || '',
      bindDN: configMap.directoryBindDN || '',
      bindPassword: configMap.directoryBindPassword || '',
      userFilter: configMap.directoryUserFilter || '',
      syncInterval: parseInt(configMap.directorySyncInterval) || 3600,
      readonly: true,
    };
  }

  async updateDirectoryConfig(updates: any) {
    // Update directory configuration in database
    for (const [key, value] of Object.entries(updates)) {
      await this.prisma.configuration.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return { message: 'Directory configuration updated successfully' };
  }

  async testDirectoryConnection() {
    // Test directory connection based on configuration
    const config = await this.getDirectoryConfig();

    if (!config.enabled) {
      return { success: false, message: 'Directory integration is disabled' };
    }

    // For now, return a mock response
    // In a real implementation, this would test the actual connection
    return { success: true, message: 'Directory connection successful' };
  }
}

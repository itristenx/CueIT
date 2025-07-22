import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigurationService {
  constructor(private prisma: PrismaService) {}

  async getConfiguration() {
    const configs = await this.prisma.configuration.findMany();
    return configs.reduce((acc: Record<string, string>, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});
  }

  async updateConfiguration(updates: Record<string, any>) {
    const results: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const result = await this.prisma.configuration.upsert({
        where: { key },
        update: {
          value: String(value),
          updatedAt: new Date(),
        },
        create: {
          key,
          value: String(value),
          type: 'string',
          category: 'general',
        },
      });
      results.push(result);
    }

    return { message: 'Configuration updated', updated: results.length };
  }

  async getConfigValue(key: string) {
    const config = await this.prisma.configuration.findUnique({
      where: { key },
    });
    return config?.value || null;
  }

  async setConfigValue(
    key: string,
    value: any,
    type: string = 'string',
    category: string = 'general',
  ) {
    return await this.prisma.configuration.upsert({
      where: { key },
      update: {
        value: String(value),
        type,
        category,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: String(value),
        type,
        category,
      },
    });
  }

  async getStatusConfig() {
    const keys = [
      'statusEnabled',
      'currentStatus',
      'statusOpenMsg',
      'statusClosedMsg',
      'statusErrorMsg',
      'statusMeetingMsg',
      'statusBrbMsg',
      'statusLunchMsg',
      'statusUnavailableMsg',
    ];

    const configs = await this.prisma.configuration.findMany({
      where: { key: { in: keys } },
    });

    const configMap: Record<string, string> = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});

    return {
      enabled:
        configMap.statusEnabled === '1' || configMap.statusEnabled === 'true',
      currentStatus: configMap.currentStatus || 'closed',
      openMessage: configMap.statusOpenMsg || 'Help Desk is Open',
      closedMessage: configMap.statusClosedMsg || 'Help Desk is Closed',
      errorMessage:
        configMap.statusErrorMsg || 'Service temporarily unavailable',
      meetingMessage: configMap.statusMeetingMsg || 'In a Meeting - Back Soon',
      brbMessage: configMap.statusBrbMsg || 'Be Right Back',
      lunchMessage: configMap.statusLunchMsg || 'Out to Lunch - Back in 1 Hour',
      unavailableMessage:
        configMap.statusUnavailableMsg || 'Status Unavailable',
    };
  }

  async updateStatusConfig(config: any) {
    const updates = {};

    if (config.enabled !== undefined)
      updates['statusEnabled'] = config.enabled ? '1' : '0';
    if (config.currentStatus !== undefined)
      updates['currentStatus'] = config.currentStatus;
    if (config.openMessage !== undefined)
      updates['statusOpenMsg'] = config.openMessage;
    if (config.closedMessage !== undefined)
      updates['statusClosedMsg'] = config.closedMessage;
    if (config.errorMessage !== undefined)
      updates['statusErrorMsg'] = config.errorMessage;
    if (config.meetingMessage !== undefined)
      updates['statusMeetingMsg'] = config.meetingMessage;
    if (config.brbMessage !== undefined)
      updates['statusBrbMsg'] = config.brbMessage;
    if (config.lunchMessage !== undefined)
      updates['statusLunchMsg'] = config.lunchMessage;
    if (config.unavailableMessage !== undefined)
      updates['statusUnavailableMsg'] = config.unavailableMessage;

    return await this.updateConfiguration(updates);
  }

  async getDirectoryConfig() {
    const keys = [
      'directoryEnabled',
      'directoryProvider',
      'directoryUrl',
      'directoryBaseDN',
      'directoryBindDN',
      'directoryBindPassword',
    ];

    const configs = await this.prisma.configuration.findMany({
      where: { key: { in: keys } },
    });

    const configMap: Record<string, string> = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {});

    return {
      enabled:
        configMap.directoryEnabled === '1' ||
        configMap.directoryEnabled === 'true',
      provider: configMap.directoryProvider || 'ldap',
      url: configMap.directoryUrl || '',
      baseDN: configMap.directoryBaseDN || '',
      bindDN: configMap.directoryBindDN || '',
      bindPassword: configMap.directoryBindPassword || '',
    };
  }

  async updateDirectoryConfig(config: any) {
    const updates = {};

    if (config.enabled !== undefined)
      updates['directoryEnabled'] = config.enabled ? '1' : '0';
    if (config.provider !== undefined)
      updates['directoryProvider'] = config.provider;
    if (config.url !== undefined) updates['directoryUrl'] = config.url;
    if (config.baseDN !== undefined) updates['directoryBaseDN'] = config.baseDN;
    if (config.bindDN !== undefined) updates['directoryBindDN'] = config.bindDN;
    if (config.bindPassword !== undefined)
      updates['directoryBindPassword'] = config.bindPassword;

    return await this.updateConfiguration(updates);
  }
}

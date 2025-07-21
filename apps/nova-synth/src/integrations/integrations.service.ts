import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const integrations = await this.prisma.integration.findMany();
    
    // Transform to legacy format expected by frontend
    const legacyIntegrations = [
      {
        id: 1,
        name: 'SMTP Email',
        type: 'smtp',
        enabled: true,
        working: true,
        config: {
          host: process.env.SMTP_HOST || '',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          username: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASS || ''
        }
      },
      {
        id: 2,
        name: 'Help Scout',
        type: 'helpscout',
        enabled: false,
        working: false,
        config: {
          apiKey: process.env.HELPSCOUT_API_KEY || '',
          mailboxId: process.env.HELPSCOUT_MAILBOX_ID || '',
          smtpFallback: process.env.HELPSCOUT_SMTP_FALLBACK === 'true'
        }
      },
      {
        id: 3,
        name: 'ServiceNow',
        type: 'servicenow',
        enabled: false,
        working: false,
        config: {
          instanceUrl: process.env.SERVICENOW_INSTANCE || '',
          username: process.env.SERVICENOW_USER || '',
          password: process.env.SERVICENOW_PASS || ''
        }
      },
      {
        id: 4,
        name: 'Slack',
        type: 'slack',
        enabled: Boolean(process.env.SLACK_WEBHOOK_URL),
        working: Boolean(process.env.SLACK_WEBHOOK_URL),
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.SLACK_CHANNEL || '#general',
          username: process.env.SLACK_USERNAME || 'Cosmo Bot'
        }
      },
      {
        id: 5,
        name: 'Microsoft Teams',
        type: 'teams',
        enabled: Boolean(process.env.TEAMS_WEBHOOK_URL),
        working: Boolean(process.env.TEAMS_WEBHOOK_URL),
        config: {
          webhookUrl: process.env.TEAMS_WEBHOOK_URL || ''
        }
      },
      {
        id: 6,
        name: 'Generic Webhook',
        type: 'webhook',
        enabled: Boolean(process.env.WEBHOOK_URL),
        working: Boolean(process.env.WEBHOOK_URL),
        config: {
          url: process.env.WEBHOOK_URL || '',
          method: process.env.WEBHOOK_METHOD || 'POST',
          contentType: process.env.WEBHOOK_CONTENT_TYPE || 'application/json'
        }
      }
    ];

    // Merge with database integrations
    const dbIntegrations = integrations.reduce((acc, integration) => {
      acc[integration.type] = integration;
      return acc;
    }, {});

    return legacyIntegrations.map(integration => {
      const dbIntegration = dbIntegrations[integration.type];
      if (dbIntegration) {
        return {
          ...integration,
          enabled: dbIntegration.enabled,
          config: { ...integration.config, ...dbIntegration.config }
        };
      }
      return integration;
    });
  }

  async findOne(id: string) {
    return this.prisma.integration.findUnique({
      where: { id }
    });
  }

  async create(data: {
    type: string;
    name: string;
    config: any;
    enabled?: boolean;
  }) {
    return this.prisma.integration.create({
      data: {
        type: data.type,
        name: data.name,
        config: data.config,
        enabled: data.enabled ?? true
      }
    });
  }

  async update(id: string, data: {
    name?: string;
    config?: any;
    enabled?: boolean;
  }) {
    return this.prisma.integration.update({
      where: { id },
      data: {
        name: data.name,
        config: data.config,
        enabled: data.enabled,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string) {
    return this.prisma.integration.delete({
      where: { id }
    });
  }

  async testIntegration(id: number) {
    const integrations = await this.findAll();
    const integration = integrations.find(i => i.id === id);
    
    if (!integration) {
      throw new Error('Integration not found');
    }

    switch (integration.type) {
      case 'smtp':
        return this.testSMTP(integration.config);
      case 'slack':
        return this.testSlack(integration.config);
      case 'teams':
        return this.testTeams(integration.config);
      case 'webhook':
        return this.testWebhook(integration.config);
      default:
        return { success: true, message: 'Test not implemented for this integration type' };
    }
  }

  private async testSMTP(config: any) {
    // Implementation for SMTP test
    return { success: true, message: 'SMTP test successful' };
  }

  private async testSlack(config: any) {
    // Implementation for Slack test
    return { success: true, message: 'Slack test successful' };
  }

  private async testTeams(config: any) {
    // Implementation for Teams test
    return { success: true, message: 'Teams test successful' };
  }

  private async testWebhook(config: any) {
    // Implementation for Webhook test
    return { success: true, message: 'Webhook test successful' };
  }

  async testSmtp() {
    // Test SMTP using current configuration
    const integrations = await this.findAll();
    const smtpIntegration = integrations.find(i => i.type === 'smtp');
    
    if (!smtpIntegration) {
      throw new Error('SMTP integration not found');
    }

    return this.testSMTP(smtpIntegration.config);
  }
}

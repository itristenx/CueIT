import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServerService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getServerInfo() {
    let serverInfo = await this.prisma.serverInfo.findFirst();

    if (!serverInfo) {
      // Create default server info if none exists
      serverInfo = await this.prisma.serverInfo.create({
        data: {
          version: '2.0.0',
          environment: this.config.get('NODE_ENV', 'development'),
          maintenance: false,
          name: 'nova-synth-server',
        },
      });
    }

    return {
      ...serverInfo,
      organizationName: this.config.get<string>(
        'ORGANIZATION_NAME',
        'Nova Universe Organization',
      ),
      organizationLogoUrl: this.config.get<string>('ORGANIZATION_LOGO_URL', ''),
      minPinLength: parseInt(this.config.get<string>('MIN_PIN_LENGTH', '4')),
      maxPinLength: parseInt(this.config.get<string>('MAX_PIN_LENGTH', '8')),
      apiVersion: '2.0.0',
    };
  }

  async updateServerInfo(data: {
    version: string;
    environment: string;
    maintenance: boolean;
    announcement: string;
    metadata: Record<string, unknown>;
  }): Promise<unknown> {
    const serverInfo = await this.prisma.serverInfo.findFirst();

    if (serverInfo) {
      return await this.prisma.serverInfo.update({
        where: { id: serverInfo.id },
        data: {
          version: data.version,
          environment: data.environment,
          maintenance: data.maintenance,
          announcement: data.announcement,
          metadata: JSON.stringify(data.metadata),
        },
      });
    } else {
      return await this.prisma.serverInfo.create({
        data: {
          version: data.version || '2.0.0',
          environment: data.environment || 'development',
          maintenance: data.maintenance || false,
          announcement: data.announcement,
          metadata: JSON.stringify(data.metadata),
          name: 'nova-synth-server',
        },
      });
    }
  }

  async getHealthStatus() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      const serverInfo = await this.getServerInfo();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: serverInfo.version,
        environment: serverInfo.environment,
        maintenance: serverInfo.maintenance,
        database: 'connected',
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        database: 'disconnected',
      };
    }
  }

  async setMaintenanceMode(enabled: boolean, announcement?: string) {
    const serverInfo = await this.prisma.serverInfo.findFirst();

    if (serverInfo) {
      return await this.prisma.serverInfo.update({
        where: { id: serverInfo.id },
        data: {
          maintenance: enabled,
          announcement: announcement || null,
        },
      });
    } else {
      return await this.prisma.serverInfo.create({
        data: {
          version: '2.0.0',
          environment: this.config.get('NODE_ENV', 'development'),
          maintenance: enabled,
          announcement: announcement || null,
          name: 'nova-synth-server',
        },
      });
    }
  }

  async getSystemStats() {
    const [totalUsers, totalTickets, totalKiosks, totalAssets, totalFeedback] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.ticket.count(),
        this.prisma.kiosk.count(),
        this.prisma.asset.count(),
        this.prisma.feedback.count(),
      ]);

    return {
      users: totalUsers,
      tickets: totalTickets,
      kiosks: totalKiosks,
      assets: totalAssets,
      feedback: totalFeedback,
      timestamp: new Date().toISOString(),
    };
  }
}

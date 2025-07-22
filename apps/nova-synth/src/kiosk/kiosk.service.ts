import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KioskService {
  constructor(private prisma: PrismaService) {}

  async getAllKiosks() {
    // Get all kiosks from database
    const kiosks = await this.prisma.kiosk.findMany({
      include: {
        activations: true,
      },
    });
    return kiosks;
  }

  async getKioskById(id: string) {
    return await this.prisma.kiosk.findUnique({
      where: { id },
      include: {
        activations: true,
      },
    });
  }

  async createKiosk(data: any) {
    return await this.prisma.kiosk.create({
      data: {
        name: data.name,
        location: data.location,
        logoUrl: data.logoUrl,
        bgUrl: data.bgUrl,
        active: data.active || true,
        status: data.status || 'open',
        lastSeen: new Date(),
      },
    });
  }

  async updateKiosk(id: string, data: any) {
    return await this.prisma.kiosk.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        logoUrl: data.logoUrl,
        bgUrl: data.bgUrl,
        active: data.active,
        status: data.status,
        lastSeen: data.lastSeen ? new Date(data.lastSeen) : undefined,
      },
    });
  }

  async deleteKiosk(id: string) {
    return await this.prisma.kiosk.delete({
      where: { id },
    });
  }

  async generateActivationCode(kioskId?: string) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrCode = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-size="16">${code}</text></svg>`).toString('base64')}`;

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    return await this.prisma.kioskActivation.create({
      data: {
        code,
        qrCode,
        expiresAt,
        kioskId,
      },
    });
  }

  async activateKiosk(code: string, kioskData: any) {
    const activation = await this.prisma.kioskActivation.findFirst({
      where: {
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!activation) {
      throw new Error('Invalid or expired activation code');
    }

    // Create or update kiosk
    let kiosk;
    if (activation.kioskId) {
      kiosk = await this.updateKiosk(activation.kioskId, kioskData);
    } else {
      kiosk = await this.createKiosk(kioskData);
    }

    // Mark activation as used
    await this.prisma.kioskActivation.update({
      where: { id: activation.id },
      data: {
        used: true,
        usedAt: new Date(),
        kioskId: kiosk.id,
      },
    });

    return kiosk;
  }

  async getKioskConfig(kioskId: string) {
    const kiosk = await this.getKioskById(kioskId);
    if (!kiosk) {
      // Return default configuration for unknown kiosks
      return {
        id: 'unknown',
        name: 'Kiosk',
        location: 'Unknown',
        logoUrl: null,
        bgUrl: null,
        active: true,
        status: 'open',
        permissions: {
          allowTicketSubmission: true,
          allowAdminAccess: true,
          allowStatusChange: true,
        },
      };
    }

    return {
      ...kiosk,
      permissions: {
        allowTicketSubmission: kiosk.active,
        allowAdminAccess: true,
        allowStatusChange: true,
      },
    };
  }
}

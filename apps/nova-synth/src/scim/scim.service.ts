import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScimService {
  constructor(private prisma: PrismaService) {}

  async getScimConfig() {
    // Get SCIM configuration from database
    const configs = await this.prisma.configuration.findMany({
      where: {
        key: {
          in: [
            'scimEnabled',
            'scimToken',
            'scimEndpoint',
            'scimAutoProvisioning',
            'scimAutoDeprovisioning',
            'scimSyncInterval',
            'scimLastSync',
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
      enabled: configMap.scimEnabled === 'true',
      token: configMap.scimToken ? '***CONFIGURED***' : '',
      endpoint: configMap.scimEndpoint || '/scim/v2',
      autoProvisioning: configMap.scimAutoProvisioning === 'true',
      autoDeprovisioning: configMap.scimAutoDeprovisioning === 'true',
      syncInterval: parseInt(configMap.scimSyncInterval) || 3600,
      lastSync: configMap.scimLastSync || null,
    };
  }

  async updateScimConfig(updates: any) {
    // Update SCIM configuration in database
    const flatUpdates = this.flattenScimConfig(updates);

    for (const [key, value] of Object.entries(flatUpdates)) {
      await this.prisma.configuration.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return { message: 'SCIM configuration updated successfully' };
  }

  async createUser(userData: any) {
    // SCIM user creation
    const user = await this.prisma.user.create({
      data: {
        clerkId: userData.externalId || userData.id,
        email: userData.userName,
        firstName:
          userData.name?.givenName ||
          userData.displayName?.split(' ')[0] ||
          userData.userName,
        lastName:
          userData.name?.familyName ||
          userData.displayName?.split(' ')[1] ||
          '',
        displayName: userData.displayName || userData.userName,
        status: userData.active !== false ? 'ACTIVE' : 'INACTIVE',
      },
    });

    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.id,
      externalId: user.clerkId,
      userName: user.email,
      displayName: user.displayName,
      active: user.status === 'ACTIVE',
      meta: {
        resourceType: 'User',
        created: user.createdAt,
        lastModified: user.updatedAt,
      },
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.id,
      externalId: user.clerkId,
      userName: user.email,
      displayName: user.displayName,
      active: user.status === 'ACTIVE',
      meta: {
        resourceType: 'User',
        created: user.createdAt,
        lastModified: user.updatedAt,
      },
    };
  }

  async updateUser(id: string, userData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: userData.userName,
        firstName:
          userData.name?.givenName ||
          userData.displayName?.split(' ')[0] ||
          userData.userName,
        lastName:
          userData.name?.familyName ||
          userData.displayName?.split(' ')[1] ||
          '',
        displayName: userData.displayName || userData.userName,
        status: userData.active !== false ? 'ACTIVE' : 'INACTIVE',
      },
    });

    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.id,
      externalId: user.clerkId,
      userName: user.email,
      displayName: user.displayName,
      active: user.status === 'ACTIVE',
      meta: {
        resourceType: 'User',
        created: user.createdAt,
        lastModified: user.updatedAt,
      },
    };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async listUsers(startIndex?: number, count?: number) {
    const skip = startIndex ? startIndex - 1 : 0;
    const take = count || 100;

    const users = await this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const totalResults = await this.prisma.user.count();

    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults,
      startIndex: startIndex || 1,
      itemsPerPage: users.length,
      Resources: users.map((user) => ({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: user.id,
        externalId: user.clerkId,
        userName: user.email,
        displayName: user.displayName,
        active: user.status === 'ACTIVE',
        meta: {
          resourceType: 'User',
          created: user.createdAt,
          lastModified: user.updatedAt,
        },
      })),
    };
  }

  private flattenScimConfig(config: any): Record<string, string> {
    const flattened: Record<string, string> = {};

    if (config.enabled !== undefined) {
      flattened.scimEnabled = config.enabled ? 'true' : 'false';
    }

    if (config.token !== undefined) {
      flattened.scimToken = config.token;
    }

    if (config.endpoint !== undefined) {
      flattened.scimEndpoint = config.endpoint;
    }

    if (config.autoProvisioning !== undefined) {
      flattened.scimAutoProvisioning = config.autoProvisioning
        ? 'true'
        : 'false';
    }

    if (config.autoDeprovisioning !== undefined) {
      flattened.scimAutoDeprovisioning = config.autoDeprovisioning
        ? 'true'
        : 'false';
    }

    if (config.syncInterval !== undefined) {
      flattened.scimSyncInterval = String(config.syncInterval);
    }

    return flattened;
  }
}

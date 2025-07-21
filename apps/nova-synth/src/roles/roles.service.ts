import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAllRoles() {
    return await this.prisma.userGroup.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getRoleById(id: string) {
    return await this.prisma.userGroup.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async createRole(data: any) {
    return await this.prisma.userGroup.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions || {},
      },
    });
  }

  async updateRole(id: string, data: any) {
    return await this.prisma.userGroup.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    });
  }

  async deleteRole(id: string) {
    return await this.prisma.userGroup.delete({
      where: { id },
    });
  }

  async getRolePermissions(id: string) {
    const role = await this.prisma.userGroup.findUnique({
      where: { id },
      select: {
        permissions: true,
      },
    });
    return role?.permissions || {};
  }

  async updateRolePermissions(id: string, permissions: any) {
    return await this.prisma.userGroup.update({
      where: { id },
      data: {
        permissions,
      },
    });
  }

  async getUserRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGroups: true,
      },
    });
    return user?.userGroups || [];
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userGroups: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.prisma.userGroup.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role
    const existingRole = user.userGroups.find(ug => ug.id === roleId);
    if (existingRole) {
      return { message: 'User already has this role' };
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        userGroups: {
          connect: { id: roleId },
        },
      },
      include: {
        userGroups: true,
      },
    });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        userGroups: {
          disconnect: { id: roleId },
        },
      },
      include: {
        userGroups: true,
      },
    });
  }

  async getDefaultRoles() {
    return [
      { name: 'end_user', description: 'Submit/view own tickets, public KB' },
      { name: 'manager', description: 'View team tickets, same rights as end_user' },
      { name: 'technician', description: 'Assigned tickets, comments, SLA tools' },
      { name: 'tech_lead', description: 'Full ticket access, assign, manage techs' },
      { name: 'admin', description: 'System-wide control' },
      { name: 'hr_admin', description: 'HR tickets only, KB controls' },
      { name: 'ops_admin', description: 'Ops/FAC tickets only' },
      { name: 'reporting_analyst', description: 'Report-only dashboards scoped to dept' },
      { name: 'auditor', description: 'Read-only logs and views' },
    ];
  }

  async createDefaultRoles() {
    const defaultRoles = await this.getDefaultRoles();
    const results: any[] = [];

    for (const role of defaultRoles) {
      const existingRole = await this.prisma.userGroup.findFirst({
        where: { name: role.name },
      });

      if (!existingRole) {
        const newRole = await this.prisma.userGroup.create({
          data: {
            name: role.name,
            description: role.description,
            permissions: this.getDefaultPermissions(role.name),
          },
        });
        results.push(newRole);
      }
    }

    return results;
  }

  private getDefaultPermissions(roleName: string) {
    const permissions: any = {
      tickets: { view: false, create: false, update: false, delete: false },
      users: { view: false, create: false, update: false, delete: false },
      kiosks: { view: false, create: false, update: false, delete: false },
      reports: { view: false, create: false, update: false, delete: false },
      settings: { view: false, create: false, update: false, delete: false },
      knowledgeBase: { view: false, create: false, update: false, delete: false },
    };

    switch (roleName) {
      case 'admin':
        Object.keys(permissions).forEach(key => {
          permissions[key] = { view: true, create: true, update: true, delete: true };
        });
        break;
      case 'tech_lead':
        permissions.tickets = { view: true, create: true, update: true, delete: true };
        permissions.users = { view: true, create: false, update: true, delete: false };
        permissions.kiosks = { view: true, create: true, update: true, delete: false };
        permissions.reports = { view: true, create: true, update: false, delete: false };
        permissions.knowledgeBase = { view: true, create: true, update: true, delete: true };
        break;
      case 'technician':
        permissions.tickets = { view: true, create: true, update: true, delete: false };
        permissions.knowledgeBase = { view: true, create: true, update: true, delete: false };
        break;
      case 'manager':
        permissions.tickets = { view: true, create: true, update: true, delete: false };
        permissions.users = { view: true, create: false, update: false, delete: false };
        permissions.reports = { view: true, create: false, update: false, delete: false };
        permissions.knowledgeBase = { view: true, create: false, update: false, delete: false };
        break;
      case 'end_user':
        permissions.tickets = { view: true, create: true, update: false, delete: false };
        permissions.knowledgeBase = { view: true, create: false, update: false, delete: false };
        break;
      case 'reporting_analyst':
        permissions.reports = { view: true, create: true, update: false, delete: false };
        break;
      case 'auditor':
        permissions.tickets = { view: true, create: false, update: false, delete: false };
        permissions.users = { view: true, create: false, update: false, delete: false };
        permissions.reports = { view: true, create: false, update: false, delete: false };
        break;
      default:
        // Default to end_user permissions
        permissions.tickets = { view: true, create: true, update: false, delete: false };
        permissions.knowledgeBase = { view: true, create: false, update: false, delete: false };
        break;
    }

    return permissions;
  }
}

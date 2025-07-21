import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('default')
  async getDefaultRoles() {
    return this.rolesService.getDefaultRoles();
  }

  @Post('default')
  async createDefaultRoles() {
    return this.rolesService.createDefaultRoles();
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Post()
  async createRole(@Body() createRoleDto: any) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Get(':id/permissions')
  async getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  async updateRolePermissions(@Param('id') id: string, @Body() permissions: any) {
    return this.rolesService.updateRolePermissions(id, permissions);
  }

  @Get('user/:userId')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rolesService.getUserRoles(userId);
  }

  @Post('user/:userId/assign')
  async assignRoleToUser(@Param('userId') userId: string, @Body() body: { roleId: string }) {
    return this.rolesService.assignRoleToUser(userId, body.roleId);
  }

  @Delete('user/:userId/remove/:roleId')
  async removeRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }
}

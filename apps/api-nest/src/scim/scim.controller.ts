import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { ScimService } from './scim.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('api')
export class ScimController {
  constructor(private readonly scimService: ScimService) {}

  @Get('scim-config')
  @UseGuards(ClerkAuthGuard)
  async getScimConfig() {
    return this.scimService.getScimConfig();
  }

  @Put('scim-config')
  @UseGuards(ClerkAuthGuard)
  async updateScimConfig(@Body() updates: any) {
    return this.scimService.updateScimConfig(updates);
  }

  // SCIM 2.0 Endpoints
  @Post('scim/v2/Users')
  async createScimUser(@Body() userData: any, @Headers('authorization') authHeader: string) {
    this.validateScimAuth(authHeader);
    return this.scimService.createUser(userData);
  }

  @Get('scim/v2/Users/:id')
  async getScimUser(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    this.validateScimAuth(authHeader);
    return this.scimService.getUser(id);
  }

  @Put('scim/v2/Users/:id')
  async updateScimUser(@Param('id') id: string, @Body() userData: any, @Headers('authorization') authHeader: string) {
    this.validateScimAuth(authHeader);
    return this.scimService.updateUser(id, userData);
  }

  @Delete('scim/v2/Users/:id')
  async deleteScimUser(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    this.validateScimAuth(authHeader);
    await this.scimService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Get('scim/v2/Users')
  async listScimUsers(
    @Query('startIndex') startIndex?: string,
    @Query('count') count?: string,
    @Headers('authorization') authHeader?: string
  ) {
    this.validateScimAuth(authHeader);
    return this.scimService.listUsers(
      startIndex ? parseInt(startIndex) : undefined,
      count ? parseInt(count) : undefined
    );
  }

  private validateScimAuth(authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const scimToken = process.env.SCIM_TOKEN;
    
    if (!scimToken || token !== scimToken) {
      throw new UnauthorizedException('Invalid SCIM token');
    }
  }
}

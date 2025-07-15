import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { DirectoryService } from './directory.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('api')
@UseGuards(ClerkAuthGuard)
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get('directory-config')
  async getDirectoryConfig() {
    return this.directoryService.getDirectoryConfig();
  }

  @Put('directory-config')
  async updateDirectoryConfig(@Body() updates: any) {
    return this.directoryService.updateDirectoryConfig(updates);
  }

  @Post('directory-test')
  async testDirectoryConnection() {
    return this.directoryService.testDirectoryConnection();
  }
}

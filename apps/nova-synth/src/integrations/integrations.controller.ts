import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('integrations')
@UseGuards(ClerkAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async findAll() {
    return this.integrationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    createIntegrationDto: {
      type: string;
      name: string;
      config: any;
      enabled?: boolean;
    },
  ) {
    return this.integrationsService.create(createIntegrationDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateIntegrationDto: {
      name?: string;
      config?: any;
      enabled?: boolean;
    },
  ) {
    return this.integrationsService.update(id, updateIntegrationDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.integrationsService.delete(id);
    return { message: 'Integration deleted' };
  }

  @Post(':id/test')
  async testIntegration(@Param('id', ParseIntPipe) id: number) {
    return this.integrationsService.testIntegration(id);
  }

  @Post('test-smtp')
  async testSmtp() {
    return this.integrationsService.testSmtp();
  }
}

// Legacy API endpoints for backward compatibility
@Controller('api')
@UseGuards(ClerkAuthGuard)
export class IntegrationsLegacyController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('integrations')
  async getIntegrations() {
    return this.integrationsService.findAll();
  }

  @Put('integrations/:id')
  async updateIntegration(@Param('id') id: string, @Body() updateData: any) {
    return this.integrationsService.update(id, updateData);
  }

  @Post('test-smtp')
  async testSmtp() {
    return this.integrationsService.testSmtp();
  }
}

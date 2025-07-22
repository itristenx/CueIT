import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KioskService } from './kiosk.service';

@Controller('kiosks')
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  @Get()
  async getAllKiosks() {
    return this.kioskService.getAllKiosks();
  }

  @Get(':id')
  async getKioskById(@Param('id') id: string) {
    return this.kioskService.getKioskById(id);
  }

  @Get(':id/remote-config')
  async getKioskConfig(@Param('id') id: string) {
    return this.kioskService.getKioskConfig(id);
  }

  @Post()
  async createKiosk(@Body() createKioskDto: any) {
    return this.kioskService.createKiosk(createKioskDto);
  }

  @Put(':id')
  async updateKiosk(@Param('id') id: string, @Body() updateKioskDto: any) {
    return this.kioskService.updateKiosk(id, updateKioskDto);
  }

  @Delete(':id')
  async deleteKiosk(@Param('id') id: string) {
    return this.kioskService.deleteKiosk(id);
  }

  @Post('generate-activation')
  async generateActivationCode(@Body() body: { kioskId?: string }) {
    return this.kioskService.generateActivationCode(body.kioskId);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateKiosk(@Body() body: { code: string; kioskData: any }) {
    return this.kioskService.activateKiosk(body.code, body.kioskData);
  }

  @Post('register-kiosk')
  @HttpCode(HttpStatus.OK)
  async registerKiosk(@Body() registerKioskDto: any) {
    return this.kioskService.createKiosk(registerKioskDto);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async getAllAssets() {
    return this.assetsService.getAllAssets();
  }

  @Get(':id')
  async getAssetById(@Param('id') id: string) {
    return this.assetsService.getAssetById(id);
  }

  @Post()
  async createAsset(@Body() createAssetDto: any) {
    return this.assetsService.createAsset(createAssetDto);
  }

  @Put(':id')
  async updateAsset(@Param('id') id: string, @Body() updateAssetDto: any) {
    return this.assetsService.updateAsset(id, updateAssetDto);
  }

  @Delete(':id')
  async deleteAsset(@Param('id') id: string) {
    return this.assetsService.deleteAsset(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(@UploadedFile() file: any, @Body() metadata?: any) {
    return this.assetsService.uploadAsset(file, metadata);
  }
}

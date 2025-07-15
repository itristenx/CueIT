import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async getAllAssets() {
    return await this.prisma.asset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAssetById(id: string) {
    return await this.prisma.asset.findUnique({
      where: { id },
    });
  }

  async createAsset(data: any) {
    return await this.prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        metadata: data.metadata,
      },
    });
  }

  async updateAsset(id: string, data: any) {
    return await this.prisma.asset.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        metadata: data.metadata,
      },
    });
  }

  async deleteAsset(id: string) {
    return await this.prisma.asset.delete({
      where: { id },
    });
  }

  async uploadAsset(file: any, metadata?: any) {
    // This would typically involve file upload logic
    // For now, we'll create a basic asset record
    const asset = await this.createAsset({
      name: file.originalname,
      type: file.mimetype.split('/')[0],
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      metadata: metadata || {},
    });

    return asset;
  }
}

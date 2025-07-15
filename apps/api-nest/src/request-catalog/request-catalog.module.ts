import { Module } from '@nestjs/common';
import { RequestCatalogService } from './request-catalog.service';
import { RequestCatalogController } from './request-catalog.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RequestCatalogController],
  providers: [RequestCatalogService],
  exports: [RequestCatalogService],
})
export class RequestCatalogModule {}

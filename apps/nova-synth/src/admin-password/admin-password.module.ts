import { Module } from '@nestjs/common';
import { AdminPasswordService } from './admin-password.service';
import { AdminPasswordController } from './admin-password.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminPasswordController],
  providers: [AdminPasswordService],
  exports: [AdminPasswordService],
})
export class AdminPasswordModule {}

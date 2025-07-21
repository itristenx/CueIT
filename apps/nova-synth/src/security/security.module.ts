import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { SpamFilterService } from './spam-filter.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SecurityController],
  providers: [SecurityService, SpamFilterService],
  exports: [SecurityService, SpamFilterService],
})
export class SecurityModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { AuthService } from './auth.service';
import { NovaIdService } from './nova-id.service';
import { NovaIdController } from './nova-id.controller';

@Module({
  imports: [ConfigModule],
  providers: [ClerkAuthGuard, AuthService, NovaIdService],
  controllers: [NovaIdController],
  exports: [ClerkAuthGuard, AuthService, NovaIdService],
})
export class AuthModule {}

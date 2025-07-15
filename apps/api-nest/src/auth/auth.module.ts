import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule],
  providers: [ClerkAuthGuard, AuthService],
  exports: [ClerkAuthGuard, AuthService],
})
export class AuthModule {}

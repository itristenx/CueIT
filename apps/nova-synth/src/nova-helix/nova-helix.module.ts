import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NovaHelixService } from './nova-helix.service';
import { NovaHelixController } from './nova-helix.controller';
import { NovaIdService } from './nova-id.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nova-helix-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [NovaHelixController],
  providers: [NovaHelixService, NovaIdService],
  exports: [NovaHelixService, NovaIdService, JwtModule],
})
export class NovaHelixModule {}

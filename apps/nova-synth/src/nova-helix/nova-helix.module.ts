import { Module } from '@nestjs/common';
import { NovaHelixService } from './nova-helix.service';
import { NovaHelixController } from './nova-helix.controller';
import { NovaIdService } from './nova-id.service';

@Module({
  controllers: [NovaHelixController],
  providers: [NovaHelixService, NovaIdService],
  exports: [NovaHelixService, NovaIdService],
})
export class NovaHelixModule {}

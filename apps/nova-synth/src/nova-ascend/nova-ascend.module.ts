import { Module } from '@nestjs/common';
import { NovaAscendService } from './nova-ascend.service';
import { NovaAscendController } from './nova-ascend.controller';

@Module({
  controllers: [NovaAscendController],
  providers: [NovaAscendService],
  exports: [NovaAscendService],
})
export class NovaAscendModule {}

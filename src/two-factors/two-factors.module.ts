import { Module } from '@nestjs/common';
import { TwoFactorsController } from './two-factors.controller';
import { TwoFactorsService } from './two-factors.service';
import { TwoFactorsRepository } from './repositories/two-factors.repository';
import { ClientAppGuard } from '../common/guards/client-app.guard';

@Module({
  controllers: [TwoFactorsController],
  providers: [TwoFactorsService, TwoFactorsRepository, ClientAppGuard],
})
export class TwoFactorsModule {}

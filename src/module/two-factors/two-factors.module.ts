import { Module } from '@nestjs/common';
import { ClientAppGuard } from '../../common/guards/client-app.guard';
import { TwoFactorsRepository } from './repositories/two-factors.repository';
import { TwoFactorsController } from './two-factors.controller';
import { TwoFactorsService } from './two-factors.service';

@Module({
  controllers: [TwoFactorsController],
  providers: [TwoFactorsService, TwoFactorsRepository, ClientAppGuard],
})
export class TwoFactorsModule {}

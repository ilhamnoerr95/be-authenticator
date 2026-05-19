import { Module } from '@nestjs/common';
import { ClientAppGuard } from '../../common/guards/client-app.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, ClientAppGuard],
})
export class AuthModule {}

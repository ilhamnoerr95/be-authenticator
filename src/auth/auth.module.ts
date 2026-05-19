import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { ClientAppGuard } from '../common/guards/client-app.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, ClientAppGuard],
})
export class AuthModule {}

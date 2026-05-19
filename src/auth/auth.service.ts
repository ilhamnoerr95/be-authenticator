import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthRepository } from './repositories/auth.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import type { ClientAppContext } from '../common/types/client-app.interface';
import { RegisteredUserResult, UserWithAppInfo } from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authRepository: AuthRepository) {}

  async registerUser(dto: RegisterUserDto, clientApp: ClientAppContext): Promise<RegisteredUserResult> {
    this.logger.log(`Registering user ${dto.email} for client app [${clientApp.name}]`);

    const existing = await this.authRepository.findUserByEmailAndClientApp(dto.email, clientApp.id);
    if (existing) {
      throw new ConflictException('User already registered for this application');
    }

    const { user } = await this.authRepository.createUserWithApplication({
      email: dto.email,
      username: dto.username,
      clientAppId: clientApp.id,
      externalUserId: dto.externalUserId,
    });

    this.logger.log(`User ${user.id} registered successfully`);

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      clientAppId: clientApp.id,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      createdAt: user.createdAt,
    };
  }

  async getUsers(clientApp: ClientAppContext): Promise<UserWithAppInfo[]> {
    const users = await this.authRepository.findUsersByClientApp(clientApp.id);
    return users.map((u) => ({
      userId: u.id,
      email: u.email,
      username: u.username,
      clientAppId: clientApp.id,
      isTwoFactorEnabled: u.isTwoFactorEnabled,
      externalUserId: u.externalUserId,
      createdAt: u.createdAt,
    }));
  }

  async getUserById(userId: string, clientApp: ClientAppContext): Promise<UserWithAppInfo> {
    const user = await this.authRepository.findUserById(userId, clientApp.id);
    if (!user) throw new NotFoundException('User not found');

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      clientAppId: clientApp.id,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      externalUserId: user.externalUserId,
      createdAt: user.createdAt,
    };
  }
}

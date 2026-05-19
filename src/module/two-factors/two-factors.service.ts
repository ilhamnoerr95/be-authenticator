import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';
import type { ClientAppContext } from '../../common/types/client-app.interface';
import { generateBackupCodes } from '../../common/utils/backup-codes.util';
import { decrypt, encrypt } from '../../common/utils/encryption.util';
import { DisableTwoFactorDto } from './dto/disable-2fa.dto';
import { SetupTwoFactorDto } from './dto/setup-2fa.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';
import { TwoFactorsRepository } from './repositories/two-factors.repository';
import {
  SetupTwoFactorResult,
  TwoFactorActionResult,
  ValidateOtpResult,
} from './types/two-factors.types';

@Injectable()
export class TwoFactorsService {
  private readonly logger = new Logger(TwoFactorsService.name);

  constructor(
    private readonly twoFactorsRepository: TwoFactorsRepository,
    private readonly configService: ConfigService,
  ) {}

  async setup(dto: SetupTwoFactorDto, clientApp: ClientAppContext): Promise<SetupTwoFactorResult> {
    this.logger.log(`Setting up 2FA for user ${dto.userId} [app: ${clientApp.name}]`);

    const user = await this.twoFactorsRepository.findUserById(dto.userId, clientApp.id);
    if (!user) throw new NotFoundException('User not found');

    const secret = generateSecret();
    const secretEncrypted = encrypt(secret);
    const backupCodes = generateBackupCodes();

    await this.twoFactorsRepository.upsertSecret(dto.userId, secretEncrypted, backupCodes);

    const appName = this.configService.get<string>('APP_NAME', 'Authenticator');
    const otpauth = generateURI({ issuer: appName, label: user.email, secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    return { userId: user.id, qrCodeDataUrl, manualEntryKey: secret, backupCodes };
  }

  async verify(
    dto: VerifyTwoFactorDto,
    clientApp: ClientAppContext,
  ): Promise<TwoFactorActionResult> {
    this.logger.log(`Verifying 2FA for user ${dto.userId} [app: ${clientApp.name}]`);

    const user = await this.twoFactorsRepository.findUserById(dto.userId, clientApp.id);
    if (!user) throw new NotFoundException('User not found');

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('Two factor authentication is already enabled');
    }

    const secret = await this.twoFactorsRepository.findSecretByUserId(dto.userId);
    if (!secret) {
      throw new UnprocessableEntityException('2FA setup not initiated. Call /setup first');
    }

    const { valid: isValid } = verifySync({
      token: dto.token,
      secret: decrypt(secret.secretEncrypted),
    });
    if (!isValid) throw new BadRequestException('Invalid OTP token');

    await this.twoFactorsRepository.markSecretVerified(dto.userId);
    await this.twoFactorsRepository.enableTwoFactor(dto.userId);

    return { success: true, message: 'Two factor authentication enabled successfully' };
  }

  async validateOtp(dto: ValidateOtpDto, clientApp: ClientAppContext): Promise<ValidateOtpResult> {
    this.logger.log(`Validating OTP for user ${dto.userId} [app: ${clientApp.name}]`);

    const user = await this.twoFactorsRepository.findUserById(dto.userId, clientApp.id);
    if (!user) throw new NotFoundException('User not found');

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('Two factor authentication is not enabled for this user');
    }

    const secret = await this.twoFactorsRepository.findSecretByUserId(dto.userId);
    if (!secret) throw new UnprocessableEntityException('Two factor secret not found');

    const { valid } = verifySync({ token: dto.token, secret: decrypt(secret.secretEncrypted) });
    return { valid };
  }

  async disable(
    dto: DisableTwoFactorDto,
    clientApp: ClientAppContext,
  ): Promise<TwoFactorActionResult> {
    this.logger.log(`Disabling 2FA for user ${dto.userId} [app: ${clientApp.name}]`);

    const user = await this.twoFactorsRepository.findUserById(dto.userId, clientApp.id);
    if (!user) throw new NotFoundException('User not found');

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('Two factor authentication is not enabled');
    }

    const secret = await this.twoFactorsRepository.findSecretByUserId(dto.userId);
    if (!secret) throw new UnprocessableEntityException('Two factor secret not found');

    const { valid: isValid } = verifySync({
      token: dto.token,
      secret: decrypt(secret.secretEncrypted),
    });
    if (!isValid) throw new BadRequestException('Invalid OTP token');

    await this.twoFactorsRepository.disableTwoFactor(dto.userId);

    return { success: true, message: 'Two factor authentication disabled successfully' };
  }
}

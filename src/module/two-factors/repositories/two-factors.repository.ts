import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TwoFactorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: string, clientAppId: string) {
    return this.prisma.identityUser.findFirst({
      where: { id: userId, userApplication: { some: { clientAppId } } },
    });
  }

  async findSecretByUserId(userId: string) {
    return this.prisma.twoFactorSecret.findUnique({ where: { userId } });
  }

  async upsertSecret(userId: string, secretEncrypted: string, backupCodes: string[]) {
    return this.prisma.twoFactorSecret.upsert({
      where: { userId },
      create: { userId, secretEncrypted, backupCodes },
      update: { secretEncrypted, backupCodes, verifiedAt: null },
    });
  }

  async markSecretVerified(userId: string) {
    return this.prisma.twoFactorSecret.update({
      where: { userId },
      data: { verifiedAt: new Date() },
    });
  }

  async enableTwoFactor(userId: string) {
    return this.prisma.identityUser.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });
  }

  async disableTwoFactor(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.twoFactorSecret.delete({ where: { userId } });
      return tx.identityUser.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: false },
      });
    });
  }
}

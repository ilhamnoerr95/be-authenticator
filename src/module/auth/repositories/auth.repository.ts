import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndClientApp(email: string, clientAppId: string) {
    const userApp = await this.prisma.userApplication.findFirst({
      where: { clientAppId, user: { email } },
      include: { user: true },
    });
    return userApp?.user ?? null;
  }

  async createUserWithApplication(data: {
    email: string;
    username: string;
    clientAppId: string;
    externalUserId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.identityUser.create({
        data: { email: data.email, username: data.username },
      });

      const userApp = await tx.userApplication.create({
        data: {
          userId: user.id,
          clientAppId: data.clientAppId,
          externalUserId: data.externalUserId,
        },
      });

      return { user, userApp };
    });
  }

  async findUsersByClientApp(clientAppId: string) {
    const userApps = await this.prisma.userApplication.findMany({
      where: { clientAppId },
      include: { user: true },
    });
    return userApps.map((ua) => ({ ...ua.user, externalUserId: ua.externalUserId }));
  }

  async findUserById(userId: string, clientAppId: string) {
    const userApp = await this.prisma.userApplication.findFirst({
      where: { userId, clientAppId },
      include: { user: true },
    });
    if (!userApp) return null;
    return { ...userApp.user, externalUserId: userApp.externalUserId };
  }
}

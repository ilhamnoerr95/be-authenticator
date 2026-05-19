import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientAppGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientId = request.headers['x-client-id'] as string;
    const clientSecret = request.headers['x-client-secret'] as string;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Missing client credentials');
    }

    const clientApp = await this.prisma.clientApp.findUnique({
      where: { clientId },
    });

    if (!clientApp || (clientApp as any).clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    (request as any).clientApp = clientApp;
    return true;
  }
}

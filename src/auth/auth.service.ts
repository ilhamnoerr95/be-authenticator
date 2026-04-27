import { Injectable } from '@nestjs/common';
import { RegisterUser } from './dto/register-auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaServe: PrismaService) {}

  async create(createAuthDto: RegisterUser) {
    const res = await this.prismaServe.user.create({
      data: createAuthDto,
    });

    return res;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

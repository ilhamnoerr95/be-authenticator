import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUser } from './dto/register-auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaServe: PrismaService) {}

  async create(createAuthDto: RegisterUser) {
    const res = await this.prismaServe.userTester.create({
      data: createAuthDto,
    });

    return res;
  }

  async findAll() {
    try {
      await Promise.reject(new Error('something went wrong'));
    } catch (error) {
      console.log((error as Error).message);
      // get 2 paremter: message (string or object) dan status code
      throw new HttpException('Forbined', HttpStatus.UNAUTHORIZED);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

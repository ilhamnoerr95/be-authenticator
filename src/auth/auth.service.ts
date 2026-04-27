import { Injectable } from '@nestjs/common';
import { RegisterUser } from './dto/register-auth';

@Injectable()
export class AuthService {
  create(createAuthDto: RegisterUser) {
    const res = {
      message: 'sukses',
      data: createAuthDto,
    };
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

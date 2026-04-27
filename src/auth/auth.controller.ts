import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './dto/register-auth';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // create users
  @Post('register')
  async create(@Body() registerUserDto: RegisterUser) {
    console.log('create user', {
      email: registerUserDto.email,
      password: registerUserDto.password,
    });

    const result = await this.authService.create(registerUserDto);
    return result;
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}

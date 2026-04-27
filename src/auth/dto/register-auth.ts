import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterUser {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

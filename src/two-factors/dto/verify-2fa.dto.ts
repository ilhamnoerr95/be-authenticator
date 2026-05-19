import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({ example: 'uuid-user-id', description: 'Internal user ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP token from authenticator app' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'token must be exactly 6 digits' })
  token: string;
}

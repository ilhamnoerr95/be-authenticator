import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetupTwoFactorDto {
  @ApiProperty({ example: 'uuid-user-id', description: 'Internal user ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

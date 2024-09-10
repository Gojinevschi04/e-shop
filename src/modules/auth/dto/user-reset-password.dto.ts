import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  newPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  confirmNewPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}

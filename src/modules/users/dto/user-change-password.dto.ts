import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  currentPassword: string;
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
}

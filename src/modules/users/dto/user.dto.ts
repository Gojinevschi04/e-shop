import { UserRole } from '../enums/user.role';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  id: number;
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty()
  @IsNotEmpty()
  username: string;
  @ApiProperty()
  @IsNotEmpty()
  // @Exclude()
  @MinLength(5)
  @MaxLength(50)
  password: string;
  @ApiProperty({ example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ enum: ['user', 'admin', 'moderator'] })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

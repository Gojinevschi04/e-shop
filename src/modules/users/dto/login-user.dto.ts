import { UserRole } from '../enums/user.role';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
  @ApiProperty({ enum: ['user', 'admin', 'moderator'] })
  role: UserRole;
}

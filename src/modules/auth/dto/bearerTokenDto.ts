import { ApiProperty } from '@nestjs/swagger';

export class BearerTokenDto {
  @ApiProperty()
  accessToken: string;
}

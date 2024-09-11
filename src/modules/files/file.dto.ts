import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FileDto {
  @ApiProperty()
  @IsNotEmpty()
  originalName: string;
  @ApiProperty()
  @IsNotEmpty()
  path: string;
  @ApiProperty()
  @IsNotEmpty()
  mimetype: string;
}

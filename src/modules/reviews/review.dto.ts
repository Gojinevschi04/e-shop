import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: number;
  @ApiProperty()
  @IsNotEmpty()
  productId: number;
  @ApiProperty()
  @IsNotEmpty()
  rating: number;
  @ApiProperty()
  @IsNotEmpty()
  content: string;
}

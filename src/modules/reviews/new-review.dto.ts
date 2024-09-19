import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class NewReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  productId: number;
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @IsNumber()
  rating: number;
  @ApiProperty()
  @IsNotEmpty()
  content: string;
}

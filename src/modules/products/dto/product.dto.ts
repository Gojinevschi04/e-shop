import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ProductDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  description: string;
  // @ApiProperty()
  // @IsNotEmpty()
  // image: Image;
  @ApiProperty()
  @IsNotEmpty()
  price: number;
  @ApiProperty()
  @IsNotEmpty()
  brand: string;
  @ApiProperty()
  @IsNotEmpty()
  color: string;
  @ApiProperty()
  @IsNotEmpty()
  material: string;
  @ApiProperty()
  @IsNotEmpty()
  isAvailable: boolean;
  @ApiProperty()
  @IsNotEmpty()
  categoryId: number;
}

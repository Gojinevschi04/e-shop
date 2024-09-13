import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty()
  userId: number;
  @ApiProperty()
  productId: number;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  totalPrice: number;
}

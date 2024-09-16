import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from './order-status';

export class OrderDto {
  @ApiProperty()
  userId: number;
  @ApiProperty()
  productsId: number[];
  @ApiProperty()
  productsQuantities: number[];
  @ApiProperty()
  status: OrderStatus;
  @ApiProperty()
  address: string;
  @ApiProperty()
  totalSum: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from './order-status';
import { PaymentStatus } from '../payments/payment-status';

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
  paymentStatus: PaymentStatus;
  @ApiProperty()
  address: string;
  @ApiProperty()
  totalSum: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../common/enums/order-status';
import { PaymentStatus } from '../../common/enums/payment-status';

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

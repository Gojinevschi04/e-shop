import { Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post(':orderId,:totalAmount')
  async pay(
    @Param('orderId') orderId: string,
    @Param('totalAmount') totalAmount: number,
  ) {
    return this.paymentsService.createPaymentIntent(orderId, totalAmount);
  }
}

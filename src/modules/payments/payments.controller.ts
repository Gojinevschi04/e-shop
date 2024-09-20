import { Controller, Headers, Param, Post, RawBody } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post(':orderId,:totalAmount')
  async pay(
    @Param('orderId') orderId: number,
    @Param('totalAmount') totalAmount: number,
  ) {
    return this.paymentsService.createPaymentIntent(orderId, totalAmount);
  }

  @Public()
  @Post('webhooks')
  async getAll(
    @RawBody() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    return this.paymentsService.paymentIntentWebhook(body, headers);
  }
}

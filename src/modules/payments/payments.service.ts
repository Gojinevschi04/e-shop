import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as util from 'node:util';

@Injectable()
export class PaymentsService {
  readonly stripe: Stripe;

  constructor(readonly configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_API_KEY') as string,
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  async createPaymentIntent(
    orderId: string,
    totalAmount: number,
  ): Promise<Stripe.PaymentIntent> {
    if (!orderId || totalAmount < 1) {
      throw new UnprocessableEntityException(
        'The payment intent could not be created',
      );
    }

    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        // Total amount to be sent is converted to cents to be used by the Stripe API
        amount: Number(totalAmount) * 100,
        currency: this.configService.get<string>('STRIPE_CURRENCY') as string,
        payment_method_types: ['card'],
        metadata: { orderId: orderId },
      };

      return await this.stripe.paymentIntents.create(paymentIntentParams);
    } catch (error) {
      Logger.error(
        '[stripeService] Error creating a payment intent',
        util.inspect(error),
      );
      throw new UnprocessableEntityException(
        'The payment intent could not be created',
      );
    }
  }
}

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as util from 'node:util';
import { PaymentIntentEvent } from '../../common/enums/payment-intent-event';
import { PaymentStatus } from '../../common/enums/payment-status';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  readonly stripe: Stripe;

  constructor(
    readonly configService: ConfigService,
    readonly emailService: EmailService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_API_KEY') as string,
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  async createPaymentIntent(
    orderId: number,
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

  async paymentIntentWebhook(
    event: Stripe.Event,
    headers: Record<string, string>,
  ) {
    const sig = headers['stripe-signature'];
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      event = this.stripe.webhooks.constructEvent(
        event as any,
        sig,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (
      ![
        'payment_intent.succeeded',
        'payment_intent.canceled',
        'payment_intent.payment_failed',
        'payment_intent.processing',
      ].includes(event.type)
    ) {
      return;
    }

    const data = event.data.object as Stripe.PaymentIntent;

    // @ts-ignore
    const metadata = data['metadata'] as any;
    const orderId = metadata.orderId as any;

    if (orderId == null) {
      throw new BadRequestException('Nonexistent order to update');
    }

    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException('Nonexistent order to update');
    }

    switch (event.type) {
      case PaymentIntentEvent.Succeeded:
        order.paymentStatus = PaymentStatus.Succeeded;
        break;

      case PaymentIntentEvent.Processing:
        order.paymentStatus = PaymentStatus.Processing;
        break;

      case PaymentIntentEvent.Failed:
        order.paymentStatus = PaymentStatus.Failed;
        break;

      case PaymentIntentEvent.Canceled:
        order.paymentStatus = PaymentStatus.Canceled;
        break;

      default:
        order.paymentStatus = PaymentStatus.Created;
        break;
    }
    await this.emailService.sendChangedOrderPaymentStatusEmail(
      order.user.email,
      order.id,
      order.paymentStatus,
    );

    const updateResult = await this.orderRepository.save(order);

    if (updateResult) {
      return `Record successfully updated with Payment Status ${order.paymentStatus}`;
    } else {
      throw new UnprocessableEntityException(
        'The payment was not successfully updated',
      );
    }
  }
}

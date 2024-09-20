import { forwardRef, Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule, StripeModuleConfig } from '@golevelup/nestjs-stripe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { EmailService } from '../email/email.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get('STRIPE_CONFIG') as StripeModuleConfig;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Order]),
    BullModule.registerQueueAsync({ name: 'email' }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, EmailService],
})
export class PaymentsModule {}

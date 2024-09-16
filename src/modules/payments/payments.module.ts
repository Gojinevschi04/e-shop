import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule, StripeModuleConfig } from '@golevelup/nestjs-stripe';

@Module({
  imports: [
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get('STRIPE_CONFIG') as StripeModuleConfig;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

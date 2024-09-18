import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { BullModule } from '@nestjs/bull';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, CartItem, Product]),
    EmailModule,
    BullModule.registerQueueAsync({ name: 'email' })
  ],
  providers: [OrdersService, PaymentsService, UsersService, EmailService],
  controllers: [OrdersController],
})
export class OrdersModule {}

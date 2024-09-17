import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { PaymentsService } from '../payments/payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, CartItem, Product])],
  providers: [OrdersService, PaymentsService],
  controllers: [OrdersController],
})
export class OrdersModule {}

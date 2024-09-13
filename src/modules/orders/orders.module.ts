import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { CartItem } from '../cart/cart-item.entity';
import { Order } from './order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, CartItem])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}

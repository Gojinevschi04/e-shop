import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { In, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Order } from './order.entity';
import { ORDER_PAGINATION_CONFIG } from './config-order';
import { plainToInstance } from 'class-transformer';
import { OrderDto } from './order.dto';
import { OrderStatus } from './order-status';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(CartItem)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: User, address: string): Promise<OrderDto> {
    const orderDto = new OrderDto();

    const items = await this.cartRepository.findBy({ user: { id: user.id } });

    if (!items) {
      throw new NotFoundException('Empty cart');
    }

    let totalSum = 0;
    for (const item of items) {
      totalSum += item.totalPrice;
    }

    orderDto.address = address;
    orderDto.status = OrderStatus.Open;

    const order = plainToInstance(Order, orderDto);
    order.user = user;
    order.products = items;
    order.totalSum = totalSum;

    return plainToInstance(OrderDto, this.orderRepository.save(order));
  }

  async update(id: number, updateOrderDto: OrderDto): Promise<OrderDto | null> {
    const oldOrderData = await this.orderRepository.findOneBy({ id: id });
    if (!oldOrderData) {
      throw new BadRequestException('Nonexistent order to update');
    }

    const user = await this.userRepository.findOneBy({
      id: updateOrderDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Invalid user id');
    }
    const items = await this.productRepository.find({
      where: {
        id: In(updateOrderDto.productsId),
      },
    });

    return plainToInstance(OrderDto, this.orderRepository.save(oldOrderData));
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<OrderDto> {
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new NotFoundException('Nonexistent order to update');
    }
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    order.status = status;
    return plainToInstance(OrderDto, this.orderRepository.save(order));
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Order>> {
    return await paginate(query, this.orderRepository, ORDER_PAGINATION_CONFIG);
  }

  async findOneById(id: number): Promise<OrderDto | null> {
    return plainToInstance(
      OrderDto,
      this.orderRepository.findOneBy({ id: id }),
    );
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}

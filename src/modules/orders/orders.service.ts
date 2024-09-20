import {
  BadRequestException, forwardRef, Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { In, Repository, UpdateResult } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Order } from './order.entity';
import { ORDER_PAGINATION_CONFIG } from './config-order';
import { plainToInstance } from 'class-transformer';
import { OrderDto } from './order.dto';
import { OrderStatus } from '../../common/enums/order-status';
import {
  calculateCartItemsTotalSum,
  calculateProductsTotalSum,
} from '../../utility/order-utils';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paymentsService: PaymentsService,
    private usersService: UsersService,
    public emailService: EmailService,
  ) {}

  async create(user: User, address: string): Promise<OrderDto> {
    const orderDto = new OrderDto();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cartProducts = await this.cartRepository.findBy({
      user: { id: user.id },
    });

    if (!cartProducts.length) {
      throw new NotFoundException('Empty cart');
    }

    orderDto.address = address;
    orderDto.status = OrderStatus.Open;

    const order = plainToInstance(Order, orderDto);
    order.user = user;
    const products = [];

    for (const cartProduct of cartProducts) {
      products.push(cartProduct.product);
    }
    await this.cartRepository.remove(cartProducts);

    order.products = products;
    order.totalSum = calculateCartItemsTotalSum(cartProducts);

    const savedOrder = await this.orderRepository.save(order);
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      savedOrder.id,
      savedOrder.totalSum,
    );
    console.log(paymentIntent.id);
    const clientSecret = paymentIntent.client_secret;
    const updatedOrder = { ...savedOrder, clientSecret: clientSecret };

    await this.emailService.sendNewOrderEmail(
      order.user.email,
      order.id,
      order.status,
    );

    return plainToInstance(OrderDto, updatedOrder);
  }

  async update(id: number, updateOrderDto: OrderDto): Promise<OrderDto | null> {
    let oldOrderData = await this.orderRepository.findOneBy({ id: id });
    if (!oldOrderData) {
      throw new BadRequestException('Nonexistent order to update');
    }

    const user = await this.userRepository.findOneBy({
      id: updateOrderDto.userId,
    });
    if (!user) {
      throw new NotFoundException('Invalid user id');
    }

    if (!Object.values(OrderStatus).includes(updateOrderDto.status)) {
      throw new BadRequestException('Invalid status');
    }

    if (
      updateOrderDto.productsId.length !==
      updateOrderDto.productsQuantities.length
    ) {
      throw new BadRequestException('Unmatched products with quantities');
    }

    const products = await this.productRepository.findBy({
      id: In(updateOrderDto.productsId),
    });

    if (!products.length) {
      throw new BadRequestException('Nonexistent products to add to order');
    }

    oldOrderData = this.orderRepository.merge(oldOrderData, updateOrderDto);

    oldOrderData.products = products;
    oldOrderData.user = user;
    oldOrderData.totalSum = calculateProductsTotalSum(
      products,
      updateOrderDto.productsQuantities,
    );

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

    await this.emailService.sendChangedOrderStatusEmail(
      order.user.email,
      order.id,
      order.status,
    );

    return plainToInstance(OrderDto, this.orderRepository.save(order));
  }

  async updateOrder(id: number, order: Order): Promise<UpdateResult> {
    await this.orderRepository.findOneBy({ id: id });
    return await this.orderRepository.update(id, order);
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

  async remove(id: number): Promise<void> {
    const data = await this.orderRepository.findOneBy({
      id: id,
    });

    if (data == null) {
      throw new BadRequestException('Nonexistent order to delete');
    }
    await this.orderRepository.delete(id);
  }
}

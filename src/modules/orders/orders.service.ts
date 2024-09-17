import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
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
import { OrderStatus } from './order-status';
import {
  calculateCartItemsTotalSum,
  calculateProductsTotalSum,
} from '../../utility/order-utils';
import { PaymentsService } from '../payments/payments.service';
import { Stripe } from 'stripe';
import { PaymentIntentEvent } from '../payments/payment-intent-event';
import { PaymentStatus } from '../payments/payment-status';

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
  ) {}

  async create(user: User, address: string): Promise<OrderDto> {
    const orderDto = new OrderDto();

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
    const clientSecret = paymentIntent.client_secret;
    const updatedOrder = { ...savedOrder, clientSecret: clientSecret };

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
    return plainToInstance(OrderDto, this.orderRepository.save(order));
  }

  async updateOrder(id: number, order: Order): Promise<UpdateResult> {
    await this.orderRepository.findOneBy({ id: id });
    return await this.orderRepository.update(id, order);
  }

  async updatePaymentStatus(event: Stripe.Event): Promise<string> {
    // @ts-ignore
    const metadata = event.data.object['metadata'] as any;
    const orderId = metadata.orderId as any;

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

      default:
        order.paymentStatus = PaymentStatus.Created;
        break;
    }

    const updateResult = await this.updateOrder(orderId, order);

    if (updateResult.affected === 1) {
      return `Record successfully updated with Payment Status ${order.paymentStatus}`;
    } else {
      throw new UnprocessableEntityException(
        'The payment was not successfully updated',
      );
    }
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

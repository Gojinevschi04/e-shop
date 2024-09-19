import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { OrdersService } from './orders.service';
import { OrderDto } from './order.dto';
import { Order } from './order.entity';
import { ORDER_PAGINATION_CONFIG } from './config-order';
import { OrderStatus } from '../../common/enums/order-status';
import { Stripe } from 'stripe';
import { Public } from '../auth/public.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':address')
  create(
    @Param('address') address: string,
    @Request() req: any,
  ): Promise<OrderDto> {
    return this.ordersService.create(req.user, address);
  }

  @PaginatedSwaggerDocs(Order, ORDER_PAGINATION_CONFIG)
  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Order>> {
    return await this.ordersService.findAll(query);
  }

  @ApiCreatedResponse({
    description: 'Order data found',
    type: OrderDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderDto | null> {
    return this.ordersService.findOneById(id);
  }

  @Put(':id,:status')
  async updateQuantity(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('status')
    status: OrderStatus,
  ): Promise<OrderDto> {
    return await this.ordersService.updateStatus(orderId, status);
  }

  @ApiBody({
    type: OrderDto,
    description: 'Update order',
  })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: OrderDto,
  ): Promise<OrderDto | null> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.ordersService.remove(id);
  }

  @Public()
  @Post('stripe/webhook')
  async webhook(@Body() event: Stripe.Event): Promise<object> {
    await this.ordersService.updatePaymentStatus(event);
    return { message: 'success' };
  }
}

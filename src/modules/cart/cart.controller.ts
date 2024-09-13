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
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CartItemDto } from './cart-item.dto';
import { CartItem } from './cart-item.entity';

@Controller('cart')
@ApiTags('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('/allByUser')
  async findAllByUser(@Request() req: any): Promise<CartItem[] | null> {
    return await this.cartService.findAllByUser(req.user.id);
  }

  @Post(':id')
  addProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Request() req: any,
  ): Promise<CartItemDto> {
    return this.cartService.addProduct(productId, req.user);
  }

  @Put(':id,:quantity')
  async updateQuantity(
    @Param('id', ParseIntPipe) cartItemId: number,
    @Param('quantity', ParseIntPipe) quantity: number,
  ): Promise<CartItemDto> {
    return await this.cartService.updateQuantity(cartItemId, quantity);
  }

  @ApiBody({
    type: CartItemDto,
    description: 'Update cart item',
  })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartItemDto: CartItemDto,
    @Request() req: any,
  ): Promise<CartItemDto | null> {
    return this.cartService.update(id, updateCartItemDto, req.user);
  }

  @Delete(':id')
  async removeProduct(@Param('id') id: number): Promise<void> {
    return this.cartService.removeProduct(id);
  }

  @Delete('')
  async removeAllByUser(@Request() req: any): Promise<void> {
    return this.cartService.removeAllByUser(req.user);
  }
}

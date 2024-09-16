import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';
import { CartItemDto } from './cart-item.dto';
import { plainToInstance } from 'class-transformer';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addProduct(productId: number, user: User): Promise<CartItemDto> {
    const cartDto = new CartItemDto();

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('Nonexistent product to add');
    }
    let cartItem = await this.cartRepository.findOneBy({
      product: { id: productId },
    });
    if (!cartItem) {
      cartDto.productId = product.id;
      cartItem = plainToInstance(CartItem, cartDto);
      cartItem.product = product;
      cartItem.user = user;
      cartItem.quantity = 1;
      cartItem.totalPrice = product.price;
    } else {
      cartItem.quantity += 1;
    }

    return plainToInstance(CartItemDto, this.cartRepository.save(cartItem));
  }

  async findAllByUser(userId: number): Promise<CartItem[] | null> {
    return await this.cartRepository.findBy({ user: { id: userId } });
  }

  async updateQuantity(
    cartItemId: number,
    quantity: number,
  ): Promise<CartItemDto> {
    const cartItem = await this.cartRepository.findOneBy({ id: cartItemId });

    if (!cartItem) {
      throw new NotFoundException('Nonexistent cart item to update');
    }

    cartItem.quantity = quantity;
    return plainToInstance(CartItemDto, this.cartRepository.save(cartItem));
  }

  async update(
    id: number,
    updateCartItemDto: CartItemDto,
    user: User,
  ): Promise<CartItemDto | null> {
    let oldCartItemData = await this.cartRepository.findOneBy({
      id: id,
    });

    if (oldCartItemData == null) {
      throw new BadRequestException('Nonexistent cart item to update');
    }
    if (updateCartItemDto.userId != user.id) {
      throw new BadRequestException('Invalid user id');
    }

    oldCartItemData = this.cartRepository.merge(
      oldCartItemData,
      updateCartItemDto,
    );

    const product = await this.productRepository.findOneBy({
      id: updateCartItemDto.productId,
    });

    if (product == null) {
      throw new BadRequestException('Nonexistent product');
    }

    oldCartItemData.product = product;
    oldCartItemData.totalPrice =
      updateCartItemDto.totalPrice * updateCartItemDto.quantity;

    return plainToInstance(
      CartItemDto,
      this.cartRepository.save(oldCartItemData),
    );
  }

  async removeProduct(id: number): Promise<void> {
    await this.cartRepository.delete(id);
  }

  async removeAllByUser(user: User): Promise<void> {
    const userData = await this.userRepository.findOneBy({ id: user.id });
    if (!userData) {
      throw new NotFoundException('Nonexistent user');
    }
    await this.cartRepository.delete({ user: userData });
  }
}

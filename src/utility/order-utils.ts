import { CartItem } from '../modules/cart/cart-item.entity';
import { Product } from '../modules/products/product.entity';

export function calculateCartItemsTotalSum(items: CartItem[]): number {
  let totalSum = 0;

  for (const item of items) {
    totalSum += item.totalPrice * item.quantity;
  }

  return totalSum;
}

export function calculateProductsTotalSum(
  products: Product[],
  quantities: number[],
): number {
  let totalSum = 0;

  for (let i = 0; i < products.length; i++) {
    totalSum += products[i].price * quantities[i];
  }

  return totalSum;
}

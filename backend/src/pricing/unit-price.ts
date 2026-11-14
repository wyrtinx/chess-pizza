import { DOUGH_DELTA, SIZE_DELTA, type Dough, type PizzaSize } from './pricing.constants.js';

export interface PricedProduct {
  category: 'PIZZA' | 'DRINK' | 'DESSERT';
  basePrice: number;
}

export interface ItemOptions {
  size: PizzaSize | null;
  dough: Dough | null;
  toppings: readonly { price: number }[];
}

export function unitPrice(product: PricedProduct, options: ItemOptions): number {
  if (product.category !== 'PIZZA') return product.basePrice;

  const sizeDelta = options.size ? SIZE_DELTA[options.size] : 0;
  const doughDelta = options.dough ? DOUGH_DELTA[options.dough] : 0;
  const toppingsTotal = options.toppings.reduce((sum, topping) => sum + topping.price, 0);

  return product.basePrice + sizeDelta + doughDelta + toppingsTotal;
}

export function lineTotal(price: number, quantity: number): number {
  return price * quantity;
}

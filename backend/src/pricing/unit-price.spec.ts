import { describe, expect, it } from 'bun:test';

import { lineTotal, unitPrice, type ItemOptions, type PricedProduct } from './unit-price.js';

const MARGHERITA: PricedProduct = { category: 'PIZZA', basePrice: 24_900 };
const LEMONADE: PricedProduct = { category: 'DRINK', basePrice: 7900 };
const TIRAMISU: PricedProduct = { category: 'DESSERT', basePrice: 13_900 };

const BURRATA = { price: 7900 };
const JALAPENO = { price: 3500 };

function options(overrides: Partial<ItemOptions> = {}): ItemOptions {
  return { size: 'CM30', dough: 'TRADITIONAL', toppings: [], ...overrides };
}

describe('unitPrice', () => {
  it.each([
    ['CM25', 18_900],
    ['CM30', 24_900],
    ['CM35', 34_900],
  ] as const)('prices a %s pizza from the 30 cm base', (size, expected) => {
    expect(unitPrice(MARGHERITA, options({ size }))).toBe(expected);
  });

  it('does not charge for thin dough', () => {
    expect(unitPrice(MARGHERITA, options({ dough: 'THIN' }))).toBe(24_900);
  });

  it('adds every topping', () => {
    expect(unitPrice(MARGHERITA, options({ toppings: [BURRATA, JALAPENO] }))).toBe(36_300);
  });

  it('combines size and toppings (PLAN 4.4: Margherita 35 cm + burrata = 428 UAH)', () => {
    expect(unitPrice(MARGHERITA, options({ size: 'CM35', toppings: [BURRATA] }))).toBe(42_800);
  });

  it.each([
    ['drink', LEMONADE],
    ['dessert', TIRAMISU],
  ])('ignores options for a %s', (_name, product) => {
    const price = unitPrice(product, options({ size: 'CM35', dough: 'THIN', toppings: [BURRATA] }));

    expect(price).toBe(product.basePrice);
  });

  it('prices a non-pizza without options', () => {
    expect(unitPrice(LEMONADE, { size: null, dough: null, toppings: [] })).toBe(7900);
  });
});

describe('lineTotal', () => {
  it('multiplies the unit price by the quantity', () => {
    expect(lineTotal(42_800, 3)).toBe(128_400);
  });
});

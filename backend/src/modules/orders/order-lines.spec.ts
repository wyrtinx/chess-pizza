import { describe, expect, it } from 'bun:test';

import { ErrorCode } from '../../common/errors/error-code.js';
import { resolveLines, type CatalogProduct, type CatalogTopping } from './order-lines.js';

const MARGHERITA: CatalogProduct = {
  id: 'margherita',
  name: { uk: 'Маргарита' },
  category: 'PIZZA',
  basePrice: 24_900,
  available: true,
};
const LEMONADE: CatalogProduct = {
  id: 'lemonade',
  name: { uk: 'Лимонад' },
  category: 'DRINK',
  basePrice: 7900,
  available: true,
};
const HIDDEN: CatalogProduct = { ...MARGHERITA, id: 'hidden', available: false };

const PRODUCTS = new Map([MARGHERITA, LEMONADE, HIDDEN].map((product) => [product.id, product]));
const TOPPINGS = new Map<string, CatalogTopping>(
  [
    { code: 'burrata', name: { uk: 'Бурата' }, price: 7900 },
    { code: 'bacon', name: { uk: 'Бекон' }, price: 5500 },
  ].map((topping) => [topping.code, topping]),
);

const pizza = { productId: 'margherita', size: 'CM35', dough: 'THIN', quantity: 1 } as const;

describe('resolveLines', () => {
  it('prices a pizza with toppings and a drink (PLAN 4.4)', () => {
    const { lines, unavailable, invalidOptions } = resolveLines(
      [
        { ...pizza, toppingCodes: ['burrata'] },
        { productId: 'lemonade', quantity: 2 },
      ],
      PRODUCTS,
      TOPPINGS,
    );

    expect(unavailable).toEqual([]);
    expect(invalidOptions).toEqual([]);
    expect(lines.map((line) => [line.unitPrice, line.lineTotal])).toEqual([
      [42_800, 42_800],
      [7900, 15_800],
    ]);
    expect(lines[1]).toMatchObject({ size: null, dough: null, toppings: [] });
  });

  it('sorts the chosen toppings by code', () => {
    const { lines } = resolveLines(
      [{ ...pizza, toppingCodes: ['burrata', 'bacon'] }],
      PRODUCTS,
      TOPPINGS,
    );

    expect(lines[0]?.toppings.map((topping) => topping.code)).toEqual(['bacon', 'burrata']);
  });

  it('reports hidden and unknown products as unavailable', () => {
    const { lines, unavailable } = resolveLines(
      [pizza, { ...pizza, productId: 'hidden' }, { ...pizza, productId: 'missing' }],
      PRODUCTS,
      TOPPINGS,
    );

    expect(lines).toHaveLength(1);
    expect(unavailable).toEqual([
      { field: 'items.1', code: ErrorCode.PRODUCT_UNAVAILABLE },
      { field: 'items.2', code: ErrorCode.PRODUCT_UNAVAILABLE },
    ]);
  });

  it.each([
    ['a pizza without a size', { productId: 'margherita', dough: 'THIN', quantity: 1 }],
    ['a pizza without dough', { productId: 'margherita', size: 'CM30', quantity: 1 }],
    ['an unknown topping', { ...pizza, toppingCodes: ['pineapple'] }],
    ['a repeated topping', { ...pizza, toppingCodes: ['bacon', 'bacon'] }],
    ['a drink with a size', { productId: 'lemonade', size: 'CM30', quantity: 1 }],
    ['a drink with toppings', { productId: 'lemonade', toppingCodes: ['bacon'], quantity: 1 }],
  ] as const)('rejects %s', (_name, input) => {
    const { lines, invalidOptions } = resolveLines([input], PRODUCTS, TOPPINGS);

    expect(lines).toEqual([]);
    expect(invalidOptions).toEqual([{ field: 'items.0', code: ErrorCode.PRODUCT_OPTIONS_INVALID }]);
  });
});

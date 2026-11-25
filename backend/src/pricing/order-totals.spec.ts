import { describe, expect, it } from 'bun:test';

import { orderTotals, percentOf } from './order-totals.js';

describe('percentOf', () => {
  it.each([
    [50_700, 10, 5100],
    [50_700, 5, 2500],
    [5000, 5, 300],
    [4900, 5, 200],
    [60_000, 5, 3000],
    [0, 5, 0],
  ])('%i kopecks × %i %% → %i (whole hryvnias, half up)', (amount, percent, expected) => {
    expect(percentOf(amount, percent)).toBe(expected);
  });
});

describe('orderTotals', () => {
  it('charges delivery below the free threshold (PLAN 4.4 basket, guest)', () => {
    expect(orderTotals([42_800, 7900], 'DELIVERY')).toEqual({
      itemsSubtotal: 50_700,
      pickupDiscount: 0,
      deliveryFee: 7900,
      freeDeliveryRemaining: 9300,
      total: 58_600,
    });
  });

  it('delivers for free from 600 UAH exactly', () => {
    const totals = orderTotals([60_000], 'DELIVERY');

    expect(totals.deliveryFee).toBe(0);
    expect(totals.freeDeliveryRemaining).toBe(0);
    expect(totals.total).toBe(60_000);
  });

  it('charges delivery one hryvnia below the threshold', () => {
    expect(orderTotals([59_900], 'DELIVERY').deliveryFee).toBe(7900);
  });

  it('gives 5 % off and no delivery fee for pickup (PLAN 4.4: 507 → 482 UAH)', () => {
    expect(orderTotals([42_800, 7900], 'PICKUP')).toEqual({
      itemsSubtotal: 50_700,
      pickupDiscount: 2500,
      deliveryFee: 0,
      freeDeliveryRemaining: 9300,
      total: 48_200,
    });
  });
});

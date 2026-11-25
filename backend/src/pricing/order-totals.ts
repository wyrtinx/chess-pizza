import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  KOPECKS_PER_POINT,
  PICKUP_DISCOUNT_PERCENT,
} from './pricing.constants.js';

export type FulfillmentKind = 'DELIVERY' | 'PICKUP';

export interface OrderTotals {
  itemsSubtotal: number;
  pickupDiscount: number;
  deliveryFee: number;
  freeDeliveryRemaining: number;
  total: number;
}

/** Percent of an amount in kopecks, rounded to whole hryvnias, half up (PLAN 4.3). */
export function percentOf(amount: number, percent: number): number {
  const hundredths = amount * percent;
  return Math.floor((hundredths + 5000) / 10_000) * KOPECKS_PER_POINT;
}

export function orderTotals(
  lineTotals: readonly number[],
  fulfillment: FulfillmentKind,
): OrderTotals {
  const itemsSubtotal = lineTotals.reduce((sum, line) => sum + line, 0);
  const pickupDiscount =
    fulfillment === 'PICKUP' ? percentOf(itemsSubtotal, PICKUP_DISCOUNT_PERCENT) : 0;
  const deliveryFee =
    fulfillment === 'DELIVERY' && itemsSubtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;

  return {
    itemsSubtotal,
    pickupDiscount,
    deliveryFee,
    freeDeliveryRemaining: Math.max(0, FREE_DELIVERY_THRESHOLD - itemsSubtotal),
    total: itemsSubtotal - pickupDiscount + deliveryFee,
  };
}

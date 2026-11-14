// Money is in kopecks, bonuses in whole points.

export const PIZZA_SIZES = ['CM25', 'CM30', 'CM35'] as const;
export type PizzaSize = (typeof PIZZA_SIZES)[number];

export const DEFAULT_PIZZA_SIZE: PizzaSize = 'CM30';
export const SIZE_DIAMETER_CM: Record<PizzaSize, number> = { CM25: 25, CM30: 30, CM35: 35 };
export const SIZE_DELTA: Record<PizzaSize, number> = { CM25: -6000, CM30: 0, CM35: 10_000 };

export const DOUGHS = ['TRADITIONAL', 'THIN'] as const;
export type Dough = (typeof DOUGHS)[number];

export const DOUGH_DELTA: Record<Dough, number> = { TRADITIONAL: 0, THIN: 0 };

// Exclusive: a pizza must cost more, otherwise the 25 cm size would be free.
export const MIN_PIZZA_BASE_PRICE = 6000;

export const DELIVERY_FEE = 7900;
export const FREE_DELIVERY_THRESHOLD = 60_000;
export const PICKUP_DISCOUNT_PERCENT = 5;
export const FIRST_ORDER_DISCOUNT_PERCENT = 10;
export const CASHBACK_PERCENT = 5;
export const KOPECKS_PER_POINT = 100;

export const ETA_MINUTES = 35;
export const OPENING_TIME = '12:00';
export const CLOSING_TIME = '23:30';
export const BUSINESS_TIME_ZONE = 'Europe/Kyiv';
export const SLOT_LEAD_MINUTES = 60;
export const DELIVERED_VISIBLE_MINUTES = 60;

export const NEW_PRODUCT_DAYS = 30;
export const HIT_PRODUCTS_COUNT = 3;

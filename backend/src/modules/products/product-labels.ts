import { HIT_PRODUCTS_COUNT, NEW_PRODUCT_DAYS } from '../../pricing/pricing.constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;

interface Rankable {
  id: string;
  sortOrder: number;
  createdAt: Date;
}

export interface LabeledProduct<T> {
  product: T;
  popularity: number;
  isNew: boolean;
  isHit: boolean;
}

export function labelProducts<T extends Rankable>(
  products: readonly T[],
  soldById: ReadonlyMap<string, number>,
  now: Date,
): LabeledProduct<T>[] {
  return products
    .map((product) => ({ product, popularity: soldById.get(product.id) ?? 0 }))
    .toSorted((a, b) => b.popularity - a.popularity || a.product.sortOrder - b.product.sortOrder)
    .map(({ product, popularity }, index) => ({
      product,
      popularity,
      isNew: now.getTime() - product.createdAt.getTime() < NEW_PRODUCT_DAYS * DAY_MS,
      isHit: index < HIT_PRODUCTS_COUNT,
    }));
}

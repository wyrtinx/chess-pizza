import { describe, expect, it } from 'bun:test';

import { labelProducts } from './product-labels.js';

const NOW = new Date('2026-11-14T12:00:00.000Z');
const LONG_AGO = new Date('2026-01-01T00:00:00.000Z');

function product(id: string, sortOrder: number, createdAt = LONG_AGO) {
  return { id, sortOrder, createdAt };
}

function ids(labeled: { product: { id: string } }[]): string[] {
  return labeled.map(({ product: { id } }) => id);
}

describe('labelProducts', () => {
  const menu = [product('d', 4), product('b', 2), product('a', 1), product('c', 3)];

  it('falls back to sortOrder while nothing is sold', () => {
    const labeled = labelProducts(menu, new Map(), NOW);

    expect(ids(labeled)).toEqual(['a', 'b', 'c', 'd']);
    expect(labeled.map(({ popularity }) => popularity)).toEqual([0, 0, 0, 0]);
  });

  it('puts best sellers first and breaks ties by sortOrder', () => {
    const sold = new Map([
      ['d', 12],
      ['c', 5],
      ['b', 5],
    ]);

    const labeled = labelProducts(menu, sold, NOW);

    expect(ids(labeled)).toEqual(['d', 'b', 'c', 'a']);
    expect(labeled[0]?.popularity).toBe(12);
  });

  it('marks the top three as hits', () => {
    const labeled = labelProducts(menu, new Map([['d', 1]]), NOW);

    expect(labeled.map(({ isHit }) => isHit)).toEqual([true, true, true, false]);
  });

  it('marks products created less than 30 days ago as new', () => {
    const fresh = product('fresh', 1, new Date('2026-10-15T12:00:00.001Z'));
    const stale = product('stale', 2, new Date('2026-10-15T12:00:00.000Z'));

    const labeled = labelProducts([fresh, stale], new Map(), NOW);

    expect(labeled.map(({ isNew }) => isNew)).toEqual([true, false]);
  });

  it('does not mutate the input', () => {
    labelProducts(menu, new Map(), NOW);

    expect(ids(menu.map((item) => ({ product: item })))).toEqual(['d', 'b', 'a', 'c']);
  });
});

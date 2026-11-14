import { describe, expect, it } from 'bun:test';

import type { Locale } from '../../generated/prisma/enums.js';
import { resolveLocale } from './resolve-locale.js';

describe('resolveLocale', () => {
  it.each<[string | undefined, Locale]>([
    ['uk-UA,uk;q=0.9,en;q=0.8', 'uk'],
    ['ru-RU,ru;q=0.9', 'uk'],
    ['be', 'uk'],
    ['UK', 'uk'],
    ['en-US,en;q=0.9,uk;q=0.8', 'en'],
    ['pl-PL', 'en'],
    ['*', 'en'],
    ['', 'en'],
    [undefined, 'en'],
  ])('maps %p to %p', (header, expected) => {
    expect(resolveLocale(header)).toBe(expected);
  });
});

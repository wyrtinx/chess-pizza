import { describe, expect, it } from 'bun:test';

import { normalizePhone } from './normalize-phone.js';

describe('normalizePhone', () => {
  it.each([
    ['+380671234567', '+380671234567'],
    ['0671234567', '+380671234567'],
    ['+380 67 123 45 67', '+380671234567'],
    ['067-123-45-67', '+380671234567'],
    ['(067) 123-45-67', '+380671234567'],
    ['+38 (067) 123 45 67', '+380671234567'],
    ['  0671234567  ', '+380671234567'],
  ])('normalizes %p to E.164', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([
    [''],
    ['067123456'],
    ['06712345678'],
    ['380671234567'],
    ['+38067123456'],
    ['+3806712345678'],
    ['+48671234567'],
    ['1671234567'],
    ['067.123.45.67'],
    ['067123456a'],
    ['+380 67 123 45 67 ext 2'],
  ])('rejects %p', (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

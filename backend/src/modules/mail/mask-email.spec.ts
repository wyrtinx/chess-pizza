import { describe, expect, it } from 'bun:test';

import { maskEmail } from './mask-email.js';

describe('maskEmail', () => {
  it('keeps the first character and the domain', () => {
    expect(maskEmail('olena.koval@gmail.com')).toBe('o***@gmail.com');
  });

  it('hides a one-character local part completely', () => {
    expect(maskEmail('o@gmail.com')).toBe('o***@gmail.com');
  });

  it('hides a value that is not an e-mail', () => {
    expect(maskEmail('olena')).toBe('***');
    expect(maskEmail('@gmail.com')).toBe('***');
  });
});

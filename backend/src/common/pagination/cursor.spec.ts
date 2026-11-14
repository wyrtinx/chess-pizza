import { describe, expect, it } from 'bun:test';

import { decodeCursor, encodeCursor } from './cursor.js';

const ID = '0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21';

function encodeRaw(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

describe('cursor', () => {
  it('round-trips createdAt and id', () => {
    const payload = { createdAt: new Date('2026-11-14T10:15:30.123Z'), id: ID };

    expect(decodeCursor(encodeCursor(payload))).toEqual(payload);
  });

  it('produces a URL-safe string', () => {
    const cursor = encodeCursor({ createdAt: new Date('2026-11-14T10:15:30.123Z'), id: ID });

    expect(cursor).toMatch(/^[\w-]+$/);
  });

  it.each([
    ['empty string', ''],
    ['not base64url', '%%%'],
    ['not JSON', Buffer.from('hello').toString('base64url')],
    ['JSON null', encodeRaw(null)],
    ['missing id', encodeRaw({ createdAt: '2026-11-14T10:15:30.123Z' })],
    ['id is not a UUID', encodeRaw({ createdAt: '2026-11-14T10:15:30.123Z', id: '42' })],
    ['invalid date', encodeRaw({ createdAt: 'yesterday', id: ID })],
    ['date is not a string', encodeRaw({ createdAt: 1731579330123, id: ID })],
  ])('rejects %s', (_name, cursor) => {
    expect(decodeCursor(cursor)).toBeNull();
  });
});

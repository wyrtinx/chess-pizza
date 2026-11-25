import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import type { NestExpressApplication } from '@nestjs/platform-express';

import request from 'supertest';

import { createTestApp } from './create-test-app.js';

describe('GET /files (smoke)', () => {
  let app: NestExpressApplication;
  const server = () => app.getHttpServer();

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a product photo that another origin may embed', async () => {
    const response = await request(server())
      .get('/files/products/margherita/card.webp')
      .expect(200);

    expect(response.headers['content-type']).toBe('image/webp');
    expect(response.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it.each(['/files/products/missing.webp', '/files/products/'])(
    'answers 404 for a missing file or a directory: %s',
    async (path) => {
      await request(server()).get(path).expect(404);
    },
  );
});

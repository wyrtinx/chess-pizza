import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import type { NestExpressApplication } from '@nestjs/platform-express';

import request from 'supertest';

import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './create-test-app.js';

describe('GET /api/v1/health (smoke)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runs against the test database', async () => {
    const rows = await app.get(PrismaService).$queryRaw<{ name: string }[]>`
      SELECT current_database() AS name
    `;

    expect(rows[0]?.name).toBe('chess_pizza_test');
  });

  it('responds 200 when the database is reachable', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('is not served without the global prefix', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });
});

describe('GET /api/v1/health with the database down (smoke)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp({
      customize: (builder) =>
        builder
          .overrideProvider(PrismaService)
          .useValue({ $queryRaw: () => Promise.reject(new Error('connection refused')) }),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds 503 in the common error format', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(503);

    expect(response.body).toEqual({
      statusCode: 503,
      code: 'INTERNAL_ERROR',
      message: 'Internal error',
      requestId: response.headers['x-request-id'],
    });
  });
});

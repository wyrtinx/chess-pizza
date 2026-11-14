import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import request from 'supertest';
import type { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('GET /api/v1/health (smoke)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
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

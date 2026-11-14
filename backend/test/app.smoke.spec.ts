import { afterEach, beforeEach, describe, it } from 'bun:test';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import request from 'supertest';
import type { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';

describe('App (smoke)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / responds with "Hello World!"', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});

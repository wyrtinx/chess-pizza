import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { minutes } from '@nestjs/throttler';

import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import request from 'supertest';

import { ErrorCode } from '../src/common/errors/error-code.js';
import { PaginationQueryDto } from '../src/common/pagination/pagination-query.dto.js';
import { AuthThrottle } from '../src/common/throttler/auth-throttle.decorator.js';
import { createTestApp } from './create-test-app.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

class ProbeItemDto {
  @IsInt({ message: ErrorCode.QUANTITY_INVALID })
  @Min(1, { message: ErrorCode.QUANTITY_INVALID })
  quantity: number;
}

class ProbeBodyDto {
  @IsString({ message: ErrorCode.NAME_REQUIRED })
  @MinLength(2, { message: ErrorCode.NAME_TOO_SHORT })
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProbeItemDto)
  items: ProbeItemDto[];
}

@Controller('probe')
class ProbeController {
  @Get()
  list(@Query() query: PaginationQueryDto): PaginationQueryDto {
    return query;
  }

  @Post()
  create(@Body() body: ProbeBodyDto): ProbeBodyDto {
    return body;
  }

  @Post('limited')
  @HttpCode(200)
  @AuthThrottle(2, minutes(1))
  limited(): { ok: true } {
    return { ok: true };
  }

  @Get('boom')
  boom(): never {
    throw new Error('secret internal details');
  }
}

describe('error format (smoke)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp({ controllers: [ProbeController] });
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers an unknown route with NOT_FOUND and a request id', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
    const requestId: unknown = response.headers['x-request-id'];

    expect(requestId).toMatch(UUID);
    expect(response.body).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Cannot GET /api/v1/nope',
      requestId,
    });
  });

  it('keeps a valid incoming X-Request-Id and replaces an invalid one', async () => {
    const kept = await request(app.getHttpServer())
      .get('/api/v1/nope')
      .set('X-Request-Id', 'client-id_42');
    const replaced = await request(app.getHttpServer())
      .get('/api/v1/nope')
      .set('X-Request-Id', 'x'.repeat(65));

    expect(kept.headers['x-request-id']).toBe('client-id_42');
    expect(kept.body).toMatchObject({ requestId: 'client-id_42' });
    expect(replaced.headers['x-request-id']).toMatch(UUID);
  });

  it('collects query validation errors into details', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/probe')
      .query({ limit: 0, cursor: 'not-a-cursor' })
      .expect(400);

    expect(response.body).toMatchObject({ statusCode: 400, code: 'VALIDATION_FAILED' });
    expect(response.body).toHaveProperty('details', [
      { field: 'limit', code: 'INVALID' },
      { field: 'cursor', code: 'CURSOR_INVALID' },
    ]);
  });

  it('applies pagination defaults', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/probe').expect(200);

    expect(response.body).toEqual({ limit: 20 });
  });

  it('reports nested and unknown body fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/probe')
      .send({ name: 'A', items: [{ quantity: 2 }, { quantity: 0 }], extra: true })
      .expect(400);

    expect(response.body).toHaveProperty('code', 'VALIDATION_FAILED');
    expect(response.body).toHaveProperty('details', [
      { field: 'extra', code: 'UNKNOWN_FIELD' },
      { field: 'name', code: 'NAME_TOO_SHORT' },
      { field: 'items.1.quantity', code: 'QUANTITY_INVALID' },
    ]);
  });

  it('answers malformed JSON with VALIDATION_FAILED', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/probe')
      .set('Content-Type', 'application/json')
      .send('{"name": ')
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      requestId: response.headers['x-request-id'],
    });
  });

  it('rejects a body over BODY_LIMIT with PAYLOAD_TOO_LARGE', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/probe')
      .send({ name: 'x'.repeat(200 * 1024), items: [] })
      .expect(413);

    expect(response.body).toMatchObject({ statusCode: 413, code: 'PAYLOAD_TOO_LARGE' });
  });

  it('does not parse form-encoded bodies', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/probe')
      .type('form')
      .send({ name: 'Anna' })
      .expect(400);

    expect(response.body).toHaveProperty('code', 'VALIDATION_FAILED');
  });

  it('hides the details of an unexpected error', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/probe/boom').expect(500);

    expect(response.body).toEqual({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Internal error',
      requestId: response.headers['x-request-id'],
    });
  });

  it('limits an @AuthThrottle route and answers RATE_LIMITED with Retry-After', async () => {
    const server = app.getHttpServer();
    await request(server).post('/api/v1/probe/limited').expect(200);
    await request(server).post('/api/v1/probe/limited').expect(200);
    const response = await request(server).post('/api/v1/probe/limited').expect(429);

    expect(response.body).toMatchObject({ statusCode: 429, code: 'RATE_LIMITED' });
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
  });
});

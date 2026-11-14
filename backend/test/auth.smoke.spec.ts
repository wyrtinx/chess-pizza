import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { Controller, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NestExpressApplication } from '@nestjs/platform-express';

import request, { type Response } from 'supertest';

import { Role } from '../src/generated/prisma/enums.js';
import { Roles } from '../src/modules/auth/decorators/roles.decorator.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './create-test-app.js';
import { deleteMail, waitForMail } from './mailpit.js';

const PASSWORD = 'pizza-lover-42';

@Controller('probe-admin')
class AdminProbeController {
  @Get()
  @Roles(Role.ADMIN)
  check(): { ok: true } {
    return { ok: true };
  }
}

function testEmail(label: string): string {
  return `smoke-auth-${label}-${crypto.randomUUID()}@example.test`;
}

function setCookies(response: Response): string[] {
  const header: unknown = response.headers['set-cookie'];
  return Array.isArray(header) ? header.filter((value) => typeof value === 'string') : [];
}

function cookieHeader(response: Response, name: string): string {
  const line = setCookies(response).find((value) => value.startsWith(`${name}=`));
  if (line === undefined) throw new Error(`No ${name} cookie in the response`);
  return line;
}

function cookieValue(response: Response, name: string): string {
  const pair = cookieHeader(response, name).split(';')[0] ?? '';
  return decodeURIComponent(pair.slice(name.length + 1));
}

async function mailedCode(to: string): Promise<string> {
  const message = await waitForMail(to);
  const code = /\b(\d{6})\b/.exec(message.Text)?.[1];
  if (code === undefined) throw new Error(`No code in the mail to ${to}`);
  return code;
}

function setUp(): Promise<NestExpressApplication> {
  return createTestApp({ controllers: [AdminProbeController] });
}

async function tearDown(app: NestExpressApplication, emails: string[]): Promise<void> {
  await app.get(PrismaService).user.deleteMany({ where: { email: { in: emails } } });
  await Promise.all(emails.map((email) => deleteMail(email)));
  await app.close();
}

function register(app: NestExpressApplication, email: string, name = 'Олена'): request.Test {
  return request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ name, email, password: PASSWORD, termsAccepted: true });
}

describe('auth: register → code → logout → login → refresh (smoke)', () => {
  const email = testEmail('flow');
  let app: NestExpressApplication;
  const server = () => app.getHttpServer();

  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await setUp();
  });
  afterAll(() => tearDown(app, [email]));

  it('registers, opens a session and mails a code', async () => {
    const response = await register(app, `  ${email.toUpperCase()} `).expect(201);

    expect(response.body).toMatchObject({
      user: { email, name: 'Олена', role: 'USER', emailVerified: false },
      retryAfter: 60,
    });
    expect(cookieHeader(response, 'cp_at')).toMatch(/HttpOnly/);
    expect(cookieHeader(response, 'cp_at')).toMatch(/SameSite=Lax/);
    expect(cookieHeader(response, 'cp_at')).toMatch(/Path=\/;/);
    expect(cookieHeader(response, 'cp_rt')).toMatch(/Path=\/api\/v1\/auth;/);

    accessToken = cookieValue(response, 'cp_at');
    refreshToken = cookieValue(response, 'cp_rt');
  });

  it('shows the session user', async () => {
    const response = await request(server())
      .get('/api/v1/auth/session')
      .set('Cookie', `cp_at=${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({ user: { email, emailVerified: false } });
  });

  it('rejects a wrong code and a too early resend', async () => {
    const code = await mailedCode(email);
    const wrong = code === '000000' ? '111111' : '000000';

    const invalid = await request(server())
      .post('/api/v1/auth/verify-email')
      .set('Cookie', `cp_at=${accessToken}`)
      .send({ code: wrong })
      .expect(400);
    expect(invalid.body).toMatchObject({ code: 'CODE_INVALID' });

    const tooSoon = await request(server())
      .post('/api/v1/auth/verify-email/resend')
      .set('Cookie', `cp_at=${accessToken}`)
      .expect(429);
    expect(tooSoon.body).toMatchObject({ code: 'RESEND_TOO_SOON' });
    expect(Number(tooSoon.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('verifies the e-mail with the mailed code', async () => {
    const code = await mailedCode(email);

    const response = await request(server())
      .post('/api/v1/auth/verify-email')
      .set('Cookie', `cp_at=${accessToken}`)
      .send({ code })
      .expect(200);
    expect(response.body).toMatchObject({ user: { email, emailVerified: true } });

    const again = await request(server())
      .post('/api/v1/auth/verify-email')
      .set('Cookie', `cp_at=${accessToken}`)
      .send({ code })
      .expect(409);
    expect(again.body).toMatchObject({ code: 'EMAIL_ALREADY_VERIFIED' });
  });

  it('returns the profile', async () => {
    const response = await request(server())
      .get('/api/v1/users/me')
      .set('Cookie', `cp_at=${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      email,
      emailVerified: true,
      phone: null,
      address: null,
      bonusBalance: 0,
    });
  });

  it('logs out: the refresh token stops working and cookies are cleared', async () => {
    const response = await request(server())
      .post('/api/v1/auth/logout')
      .set('Cookie', `cp_rt=${refreshToken}`)
      .expect(204);
    expect(cookieHeader(response, 'cp_at')).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cookieHeader(response, 'cp_rt')).toMatch(/Expires=Thu, 01 Jan 1970/);

    const refreshed = await request(server())
      .post('/api/v1/auth/refresh')
      .set('Cookie', `cp_rt=${refreshToken}`)
      .expect(401);
    expect(refreshed.body).toMatchObject({ code: 'SESSION_INVALID' });
  });

  it('rejects a wrong password and logs in with the right one', async () => {
    const wrong = await request(server())
      .post('/api/v1/auth/login')
      .send({ email, password: 'not-the-password' })
      .expect(401);
    expect(wrong.body).toMatchObject({ code: 'INVALID_CREDENTIALS' });

    const response = await request(server())
      .post('/api/v1/auth/login')
      .send({ email: email.toUpperCase(), password: PASSWORD })
      .expect(200);
    expect(response.body).toMatchObject({ user: { email, emailVerified: true } });

    refreshToken = cookieValue(response, 'cp_rt');
  });

  it('rotates the refresh token, and a reused one revokes the session', async () => {
    const rotated = await request(server())
      .post('/api/v1/auth/refresh')
      .set('Cookie', `cp_rt=${refreshToken}`)
      .expect(200);
    expect(rotated.body).toMatchObject({ user: { email } });
    const newRefreshToken = cookieValue(rotated, 'cp_rt');
    expect(newRefreshToken).not.toBe(refreshToken);

    const reused = await request(server())
      .post('/api/v1/auth/refresh')
      .set('Cookie', `cp_rt=${refreshToken}`)
      .expect(401);
    expect(reused.body).toMatchObject({ code: 'SESSION_REUSED' });
    expect(cookieHeader(reused, 'cp_rt')).toMatch(/Expires=Thu, 01 Jan 1970/);

    const revoked = await request(server())
      .post('/api/v1/auth/refresh')
      .set('Cookie', `cp_rt=${newRefreshToken}`)
      .expect(401);
    expect(revoked.body).toMatchObject({ code: 'SESSION_INVALID' });
  });
});

describe('auth: rules and guards (smoke)', () => {
  const english = testEmail('english');
  const attempts = testEmail('attempts');
  let app: NestExpressApplication;
  const server = () => app.getHttpServer();

  beforeAll(async () => {
    app = await setUp();
  });
  afterAll(() => tearDown(app, [english, attempts]));

  it('reports every invalid registration field', async () => {
    const response = await request(server())
      .post('/api/v1/auth/register')
      .send({ name: ' A ', email: 'no-at-sign', password: 'short', termsAccepted: false })
      .expect(400);

    expect(response.body).toHaveProperty('details', [
      { field: 'name', code: 'NAME_TOO_SHORT' },
      { field: 'email', code: 'EMAIL_INVALID' },
      { field: 'password', code: 'PASSWORD_TOO_SHORT' },
      { field: 'termsAccepted', code: 'TERMS_NOT_ACCEPTED' },
    ]);

    const empty = await request(server()).post('/api/v1/auth/register').send({}).expect(400);
    expect(empty.body).toHaveProperty('details', [
      { field: 'name', code: 'NAME_TOO_SHORT' },
      { field: 'email', code: 'EMAIL_INVALID' },
      { field: 'password', code: 'PASSWORD_TOO_SHORT' },
      { field: 'termsAccepted', code: 'TERMS_NOT_ACCEPTED' },
    ]);
  });

  it('takes the locale from Accept-Language and rejects a taken e-mail', async () => {
    const response = await register(app, english, 'Olena')
      .set('Accept-Language', 'en-US,en;q=0.9')
      .expect(201);
    expect(response.body).toMatchObject({ user: { locale: 'en' } });

    const message = await waitForMail(english);
    expect(message.Subject).toBe('Your verification code — Chess Pizza');

    const taken = await register(app, english.toUpperCase()).expect(409);
    expect(taken.body).toMatchObject({ code: 'EMAIL_TAKEN' });
  });

  it('allows five attempts per code', async () => {
    const registered = await register(app, attempts).expect(201);
    const accessToken = cookieValue(registered, 'cp_at');
    const code = await mailedCode(attempts);
    const wrong = code === '000000' ? '111111' : '000000';

    const verify = (value: string) =>
      request(server())
        .post('/api/v1/auth/verify-email')
        .set('Cookie', `cp_at=${accessToken}`)
        .send({ code: value });

    // Sequential on purpose: each attempt sees the counter left by the previous one.
    const attempt = async (left: number): Promise<unknown[]> => {
      if (left === 0) return [];
      const response = await verify(wrong);
      const errorCode: unknown = response.body.code;
      return [errorCode, ...(await attempt(left - 1))];
    };

    expect(await attempt(5)).toEqual([
      'CODE_INVALID',
      'CODE_INVALID',
      'CODE_INVALID',
      'CODE_INVALID',
      'CODE_ATTEMPTS_EXCEEDED',
    ]);

    const blocked = await verify(code).expect(429);
    expect(blocked.body).toMatchObject({ code: 'CODE_ATTEMPTS_EXCEEDED' });

    const format = await verify('12345').expect(400);
    expect(format.body).toHaveProperty('details', [{ field: 'code', code: 'CODE_FORMAT_INVALID' }]);
  });

  it('treats a guest as a guest and rejects bad tokens', async () => {
    const guest = await request(server()).get('/api/v1/auth/session').expect(200);
    expect(guest.body).toEqual({ user: null });

    const anonymous = await request(server()).get('/api/v1/users/me').expect(401);
    expect(anonymous.body).toMatchObject({ code: 'UNAUTHORIZED' });

    const forged = await request(server())
      .get('/api/v1/auth/session')
      .set('Cookie', 'cp_at=not-a-jwt')
      .expect(401);
    expect(forged.body).toMatchObject({ code: 'UNAUTHORIZED' });

    const expiredToken = await app
      .get(JwtService)
      .signAsync({ sub: crypto.randomUUID(), role: 'USER' }, { expiresIn: -10 });
    const expired = await request(server())
      .get('/api/v1/auth/session')
      .set('Cookie', `cp_at=${expiredToken}`)
      .expect(401);
    expect(expired.body).toMatchObject({ code: 'TOKEN_EXPIRED' });

    const noRefresh = await request(server()).post('/api/v1/auth/refresh').expect(401);
    expect(noRefresh.body).toMatchObject({ code: 'SESSION_INVALID' });
  });

  it('lets only admins through @Roles(ADMIN)', async () => {
    const login = () =>
      request(server()).post('/api/v1/auth/login').send({ email: english, password: PASSWORD });

    const asUser = cookieValue(await login().expect(200), 'cp_at');
    const forbidden = await request(server())
      .get('/api/v1/probe-admin')
      .set('Cookie', `cp_at=${asUser}`)
      .expect(403);
    expect(forbidden.body).toMatchObject({ code: 'FORBIDDEN' });

    await app
      .get(PrismaService)
      .user.update({ where: { email: english }, data: { role: 'ADMIN' } });
    const asAdmin = cookieValue(await login().expect(200), 'cp_at');
    await request(server())
      .get('/api/v1/probe-admin')
      .set('Cookie', `cp_at=${asAdmin}`)
      .expect(200, { ok: true });
  });
});

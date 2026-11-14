import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import type { NestExpressApplication } from '@nestjs/platform-express';

import { createTransport } from 'nodemailer';

import { MAIL_TRANSPORTER } from '../src/modules/mail/mail.constants.js';
import { MailService } from '../src/modules/mail/mail.service.js';
import { createTestApp } from './create-test-app.js';
import { deleteMail, waitForMail } from './mailpit.js';

describe('MailService → Mailpit (smoke)', () => {
  const to = `smoke-${crypto.randomUUID()}@example.test`;
  let app: NestExpressApplication;
  let mail: MailService;

  beforeAll(async () => {
    app = await createTestApp();
    mail = app.get(MailService);
  });

  afterAll(async () => {
    await deleteMail(to);
    await app.close();
  });

  it('delivers the verification code with HTML and text versions', async () => {
    const sent = await mail.send(
      'verificationCode',
      to,
      { name: 'Олена', code: '482913', expiresInMinutes: 10 },
      'uk',
    );
    expect(sent).toBe(true);

    const message = await waitForMail(to);

    expect(message.To.map(({ Address }) => Address)).toEqual([to]);
    expect(message.From.Address).toBe(process.env.MAIL_FROM?.match(/<(.+)>/)?.[1] ?? '');
    expect(message.Subject).toBe('Код підтвердження — Chess Pizza');
    expect(message.Text).toContain('482913');
    expect(message.HTML).toContain('482913');
  });
});

describe('MailService with SMTP down (smoke)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp({
      customize: (builder) =>
        builder
          .overrideProvider(MAIL_TRANSPORTER)
          .useValue(createTransport({ host: '127.0.0.1', port: 1, connectionTimeout: 1000 })),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns false instead of throwing', async () => {
    const sent = await app
      .get(MailService)
      .send(
        'verificationCode',
        'olena@example.test',
        { name: 'Олена', code: '482913', expiresInMinutes: 10 },
        'uk',
      );

    expect(sent).toBe(false);
  });
});

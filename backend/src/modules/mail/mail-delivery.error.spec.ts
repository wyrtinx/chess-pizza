import { describe, expect, it } from 'bun:test';

import { MailDeliveryError } from './mail-delivery.error.js';

describe('MailDeliveryError', () => {
  it('masks the recipient in the message and stack, keeps the SMTP details', () => {
    const smtpError = Object.assign(
      new Error("Can't send mail - all recipients were rejected: 550 <Olena.K@gmail.com> unknown"),
      {
        code: 'EENVELOPE',
        responseCode: 550,
        command: 'RCPT TO',
        response: '550 <olena.k@gmail.com> unknown',
        rejected: ['olena.k@gmail.com'],
      },
    );

    const error = new MailDeliveryError(smtpError, 'olena.k@gmail.com');

    expect(error.message).toBe(
      "Can't send mail - all recipients were rejected: 550 <o***@gmail.com> unknown",
    );
    expect(error.stack).not.toContain('olena.k');
    expect(error.stack).not.toContain('Olena.K');
    expect(error.code).toBe('EENVELOPE');
    expect(error.responseCode).toBe(550);
    expect(error.command).toBe('RCPT TO');
    expect(Object.keys(error)).not.toContain('response');
    expect(Object.keys(error)).not.toContain('rejected');
  });

  it('handles values that are not errors', () => {
    const error = new MailDeliveryError('boom', 'olena.k@gmail.com');

    expect(error.message).toBe('Unknown mail delivery error');
    expect(error.code).toBeUndefined();
  });
});

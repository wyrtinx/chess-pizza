import { describe, expect, it } from 'bun:test';

import { MAIL_LOCALES } from './mail-template.types.js';
import { renderPasswordResetMail } from './password-reset.template.js';

const resetUrl = 'http://localhost:5173/reset-password?token=abc_DEF-123';
const data = { name: 'Олена', resetUrl, expiresInMinutes: 30 };

describe('renderPasswordResetMail', () => {
  it.each(MAIL_LOCALES)('puts the link and its lifetime into both versions (%s)', (locale) => {
    const mail = renderPasswordResetMail(data, locale);

    expect(mail.html).toContain(`href="${resetUrl}"`);
    expect(mail.text).toContain(resetUrl);
    expect(mail.html).toContain('30');
    expect(mail.text).toContain('30');
    expect(mail.html).toContain(`<html lang="${locale}">`);
  });

  it('is written in the requested language', () => {
    const uk = renderPasswordResetMail(data, 'uk');
    const en = renderPasswordResetMail(data, 'en');

    expect(uk.subject).toBe('Відновлення пароля — Chess Pizza');
    expect(uk.html).toContain('Змінити пароль');
    expect(uk.text).toContain('Посилання діє 30 хв і працює лише один раз.');
    expect(en.subject).toBe('Reset your password — Chess Pizza');
    expect(en.html).toContain('Reset password');
    expect(en.text).toContain('The link is valid for 30 minutes and works only once.');
  });

  it('escapes the link in HTML attributes but keeps it raw in text', () => {
    const url = 'http://localhost:5173/reset-password?token=a"b&c=1';
    const mail = renderPasswordResetMail({ ...data, resetUrl: url }, 'en');

    expect(mail.html).toContain(
      'href="http://localhost:5173/reset-password?token=a&quot;b&amp;c=1"',
    );
    expect(mail.text).toContain(url);
  });
});

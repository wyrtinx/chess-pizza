import { describe, expect, it } from 'bun:test';

import { MAIL_LOCALES } from './mail-template.types.js';
import { renderVerificationCodeMail } from './verification-code.template.js';

const data = { name: 'Олена', code: '482913', expiresInMinutes: 10 };

describe('renderVerificationCodeMail', () => {
  it.each(MAIL_LOCALES)('puts the code and its lifetime into both versions (%s)', (locale) => {
    const mail = renderVerificationCodeMail(data, locale);

    expect(mail.html).toContain('482913');
    expect(mail.text).toContain('482913');
    expect(mail.html).toContain('10');
    expect(mail.text).toContain('10');
    expect(mail.html).toContain('Олена');
    expect(mail.text).toContain('Олена');
    expect(mail.html).toStartWith('<!doctype html>');
    expect(mail.html).toContain(`<html lang="${locale}">`);
  });

  it('keeps the code out of the subject', () => {
    for (const locale of MAIL_LOCALES) {
      expect(renderVerificationCodeMail(data, locale).subject).not.toContain('482913');
    }
  });

  it('is written in the requested language', () => {
    const uk = renderVerificationCodeMail(data, 'uk');
    const en = renderVerificationCodeMail(data, 'en');

    expect(uk.subject).toBe('Код підтвердження — Chess Pizza');
    expect(uk.text).toContain('Код діє 10 хв.');
    expect(en.subject).toBe('Your verification code — Chess Pizza');
    expect(en.text).toContain('The code is valid for 10 minutes.');
  });

  it('escapes the name in HTML but not in text', () => {
    const mail = renderVerificationCodeMail({ ...data, name: '<b>Bob</b> & Co' }, 'en');

    expect(mail.html).toContain('Hi, &lt;b&gt;Bob&lt;/b&gt; &amp; Co!');
    expect(mail.html).not.toContain('<b>Bob</b>');
    expect(mail.text).toContain('Hi, <b>Bob</b> & Co!');
  });
});

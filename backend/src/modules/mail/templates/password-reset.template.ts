import {
  escapeHtml,
  MAIL_COLORS,
  mutedParagraph,
  paragraph,
  renderHtmlLayout,
  renderTextLayout,
} from './layout.js';
import type { MailLocale, MailTemplate } from './mail-template.types.js';

export interface PasswordResetMailData {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

interface PasswordResetCopy {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  button: string;
  fallback: string;
  expires: (minutes: number) => string;
  ignore: string;
}

const COPY: Record<MailLocale, PasswordResetCopy> = {
  uk: {
    subject: 'Відновлення пароля — Chess Pizza',
    greeting: (name) => `Привіт, ${name}!`,
    intro:
      'Ми отримали запит на зміну пароля до вашого акаунта Chess Pizza. Натисніть кнопку, щоб задати новий пароль:',
    button: 'Змінити пароль',
    fallback: 'Якщо кнопка не працює, скопіюйте це посилання в браузер:',
    expires: (minutes) => `Посилання діє ${minutes} хв і працює лише один раз.`,
    ignore:
      'Якщо ви не просили змінити пароль, просто проігноруйте цей лист — пароль лишиться тим самим.',
  },
  en: {
    subject: 'Reset your password — Chess Pizza',
    greeting: (name) => `Hi, ${name}!`,
    intro:
      'We received a request to reset the password for your Chess Pizza account. Click the button to choose a new one:',
    button: 'Reset password',
    fallback: "If the button doesn't work, copy this link into your browser:",
    expires: (minutes) => `The link is valid for ${minutes} minutes and works only once.`,
    ignore:
      "If you didn't ask to reset your password, just ignore this email — your password will stay the same.",
  },
};

export const renderPasswordResetMail: MailTemplate<PasswordResetMailData> = (
  { name, resetUrl, expiresInMinutes },
  locale,
) => {
  const copy = COPY[locale];
  const href = escapeHtml(resetUrl);

  const button = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 24px;">
<tr>
<td style="border-radius: 12px; background-color: ${MAIL_COLORS.accent};">
<a href="${href}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 700; color: ${MAIL_COLORS.onAccent}; text-decoration: none; border-radius: 12px;">${escapeHtml(copy.button)}</a>
</td>
</tr>
</table>`;

  const fallbackLink = `<a href="${href}" style="color: ${MAIL_COLORS.accent}; word-break: break-all;">${href}</a>`;

  return {
    subject: copy.subject,
    html: renderHtmlLayout({
      locale,
      title: copy.subject,
      preheader: copy.intro,
      content: [
        paragraph(escapeHtml(copy.greeting(name))),
        paragraph(escapeHtml(copy.intro)),
        button,
        paragraph(escapeHtml(copy.expires(expiresInMinutes))),
        mutedParagraph(escapeHtml(copy.fallback)),
        mutedParagraph(fallbackLink),
        mutedParagraph(escapeHtml(copy.ignore)),
      ].join('\n'),
    }),
    text: renderTextLayout(locale, [
      copy.greeting(name),
      copy.intro,
      resetUrl,
      copy.expires(expiresInMinutes),
      copy.ignore,
    ]),
  };
};

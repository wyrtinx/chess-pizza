import {
  escapeHtml,
  MAIL_COLORS,
  mutedParagraph,
  paragraph,
  renderHtmlLayout,
  renderTextLayout,
} from './layout.js';
import type { MailLocale, MailTemplate } from './mail-template.types.js';

export interface VerificationCodeMailData {
  name: string;
  code: string;
  expiresInMinutes: number;
}

interface VerificationCodeCopy {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  expires: (minutes: number) => string;
  ignore: string;
}

const COPY: Record<MailLocale, VerificationCodeCopy> = {
  uk: {
    subject: 'Код підтвердження — Chess Pizza',
    greeting: (name) => `Привіт, ${name}!`,
    intro: 'Щоб підтвердити пошту, введіть цей код на сайті Chess Pizza:',
    expires: (minutes) => `Код діє ${minutes} хв.`,
    ignore: 'Якщо ви не реєструвалися в Chess Pizza, просто проігноруйте цей лист.',
  },
  en: {
    subject: 'Your verification code — Chess Pizza',
    greeting: (name) => `Hi, ${name}!`,
    intro: 'To confirm your email, enter this code on the Chess Pizza website:',
    expires: (minutes) => `The code is valid for ${minutes} minutes.`,
    ignore: "If you didn't sign up for Chess Pizza, just ignore this email.",
  },
};

export const renderVerificationCodeMail: MailTemplate<VerificationCodeMailData> = (
  { name, code, expiresInMinutes },
  locale,
) => {
  const copy = COPY[locale];

  const codeBlock = `<p style="margin: 8px 0 24px; font-family: 'Courier New', Courier, monospace; font-size: 36px; line-height: 44px; font-weight: 700; letter-spacing: 8px; color: ${MAIL_COLORS.heading};">${escapeHtml(code)}</p>`;

  return {
    subject: copy.subject,
    html: renderHtmlLayout({
      locale,
      title: copy.subject,
      preheader: copy.intro,
      content: [
        paragraph(escapeHtml(copy.greeting(name))),
        paragraph(escapeHtml(copy.intro)),
        codeBlock,
        paragraph(escapeHtml(copy.expires(expiresInMinutes))),
        mutedParagraph(escapeHtml(copy.ignore)),
      ].join('\n'),
    }),
    text: renderTextLayout(locale, [
      copy.greeting(name),
      copy.intro,
      code,
      copy.expires(expiresInMinutes),
      copy.ignore,
    ]),
  };
};

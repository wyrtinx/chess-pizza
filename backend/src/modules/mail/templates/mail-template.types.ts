export const MAIL_LOCALES = ['uk', 'en'] as const;

export type MailLocale = (typeof MAIL_LOCALES)[number];

export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
}

export type MailTemplate<TData> = (data: TData, locale: MailLocale) => RenderedMail;

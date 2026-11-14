import type { MailLocale, MailTemplate, RenderedMail } from './mail-template.types.js';
import { renderPasswordResetMail, type PasswordResetMailData } from './password-reset.template.js';
import {
  renderVerificationCodeMail,
  type VerificationCodeMailData,
} from './verification-code.template.js';

export interface MailTemplateDataMap {
  verificationCode: VerificationCodeMailData;
  passwordReset: PasswordResetMailData;
}

export type MailTemplateName = keyof MailTemplateDataMap;

const MAIL_TEMPLATES: { [K in MailTemplateName]: MailTemplate<MailTemplateDataMap[K]> } = {
  verificationCode: renderVerificationCodeMail,
  passwordReset: renderPasswordResetMail,
};

export function renderMail<K extends MailTemplateName>(
  template: K,
  data: MailTemplateDataMap[K],
  locale: MailLocale,
): RenderedMail {
  const render: MailTemplate<MailTemplateDataMap[K]> = MAIL_TEMPLATES[template];
  return render(data, locale);
}

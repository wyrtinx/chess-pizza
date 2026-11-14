import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env.js';
import { MailDeliveryError } from './mail-delivery.error.js';
import type { MailTransporter } from './mail-transporter.js';
import { MAIL_TRANSPORTER } from './mail.constants.js';
import { maskEmail } from './mask-email.js';
import type { MailLocale } from './templates/mail-template.types.js';
import {
  renderMail,
  type MailTemplateDataMap,
  type MailTemplateName,
} from './templates/mail-templates.js';

@Injectable()
export class MailService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor(
    @Inject(MAIL_TRANSPORTER) private readonly transporter: MailTransporter,
    config: ConfigService<Env, true>,
  ) {
    this.from = config.get('MAIL_FROM', { infer: true });
  }

  onApplicationBootstrap(): void {
    // Not awaited: an unreachable SMTP server must not block or break startup.
    this.transporter.verify().then(
      () => this.logger.log('SMTP server is reachable'),
      (error: unknown) => this.logger.warn(error, 'SMTP server is not reachable, emails will fail'),
    );
  }

  onModuleDestroy(): void {
    this.transporter.close();
  }

  /** Never throws: returns false when the mail could not be handed over to SMTP. */
  async send<K extends MailTemplateName>(
    template: K,
    to: string,
    data: MailTemplateDataMap[K],
    locale: MailLocale,
  ): Promise<boolean> {
    try {
      const { subject, html, text } = renderMail(template, data, locale);
      const info = await this.transporter.sendMail({ from: this.from, to, subject, html, text });
      this.logger.log({ template, to: maskEmail(to), messageId: info.messageId }, 'Mail sent');
      return true;
    } catch (error) {
      this.logger.error(
        { err: new MailDeliveryError(error, to), template, to: maskEmail(to) },
        'Mail sending failed',
      );
      return false;
    }
  }
}

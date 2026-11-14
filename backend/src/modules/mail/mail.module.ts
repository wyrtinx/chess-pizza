import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createMailTransporter } from './mail-transporter.js';
import { MAIL_TRANSPORTER } from './mail.constants.js';
import { MailService } from './mail.service.js';

@Module({
  providers: [
    { provide: MAIL_TRANSPORTER, inject: [ConfigService], useFactory: createMailTransporter },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}

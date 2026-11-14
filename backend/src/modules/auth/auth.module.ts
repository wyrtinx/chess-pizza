import { Module } from '@nestjs/common';

import { MailModule } from '../mail/mail.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthCookiesService } from './auth-cookies.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { EmailVerificationService } from './email-verification.service.js';
import { SessionsService } from './sessions.service.js';

@Module({
  imports: [UsersModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, EmailVerificationService, AuthCookiesService],
})
export class AuthModule {}

import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { RetryAfterException } from '../../common/errors/retry-after.exception.js';
import type { User } from '../../generated/prisma/client.js';
import { CodePurpose } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { UsersService } from '../users/users.service.js';
import {
  VERIFICATION_CODE_MAX_ATTEMPTS,
  VERIFICATION_CODE_RESEND_SECONDS,
  VERIFICATION_CODE_TTL_MINUTES,
} from './auth.constants.js';
import { generateVerificationCode, sha256 } from './tokens.js';

const PURPOSE = CodePurpose.EMAIL_VERIFICATION;
const RESEND_MS = VERIFICATION_CODE_RESEND_SECONDS * 1000;

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly mail: MailService,
  ) {}

  /** Replaces the active code with a new one and mails it; returns seconds until the next resend. */
  async issue(user: User): Promise<number> {
    const code = generateVerificationCode();
    const now = new Date();
    const fields = {
      codeHash: sha256(code),
      expiresAt: new Date(now.getTime() + VERIFICATION_CODE_TTL_MINUTES * 60_000),
      attempts: 0,
      lastSentAt: now,
      consumedAt: null,
    };

    await this.prisma.oneTimeCode.upsert({
      where: { userId_purpose: { userId: user.id, purpose: PURPOSE } },
      create: { userId: user.id, purpose: PURPOSE, ...fields },
      update: fields,
    });

    const sent = await this.mail.send(
      'verificationCode',
      user.email,
      { name: user.name, code, expiresInMinutes: VERIFICATION_CODE_TTL_MINUTES },
      user.locale,
    );
    if (sent) return VERIFICATION_CODE_RESEND_SECONDS;

    // Nothing reached the user, so the resend cooldown must not block them.
    await this.prisma.oneTimeCode.update({
      where: { userId_purpose: { userId: user.id, purpose: PURPOSE } },
      data: { lastSentAt: new Date(now.getTime() - RESEND_MS) },
    });
    return 0;
  }

  async resend(userId: string): Promise<number> {
    const user = await this.requireUnverifiedUser(userId);
    const active = await this.prisma.oneTimeCode.findUnique({
      where: { userId_purpose: { userId, purpose: PURPOSE } },
      select: { lastSentAt: true },
    });

    if (active) {
      const waitMs = active.lastSentAt.getTime() + RESEND_MS - Date.now();
      if (waitMs > 0) {
        throw new RetryAfterException(
          ErrorCode.RESEND_TOO_SOON,
          HttpStatus.TOO_MANY_REQUESTS,
          Math.ceil(waitMs / 1000),
        );
      }
    }

    return this.issue(user);
  }

  async verify(userId: string, code: string): Promise<User> {
    await this.requireUnverifiedUser(userId);
    const where = { userId_purpose: { userId, purpose: PURPOSE } };
    const active = await this.prisma.oneTimeCode.findUnique({ where });

    if (!active || active.consumedAt !== null) {
      throw new AppException(ErrorCode.CODE_INVALID, HttpStatus.BAD_REQUEST);
    }
    if (active.expiresAt <= new Date()) {
      throw new AppException(ErrorCode.CODE_EXPIRED, HttpStatus.BAD_REQUEST);
    }
    if (active.attempts >= VERIFICATION_CODE_MAX_ATTEMPTS) throw attemptsExceeded();

    if (active.codeHash !== sha256(code)) {
      const { attempts } = await this.prisma.oneTimeCode.update({
        where,
        data: { attempts: { increment: 1 } },
        select: { attempts: true },
      });
      if (attempts >= VERIFICATION_CODE_MAX_ATTEMPTS) throw attemptsExceeded();
      throw new AppException(ErrorCode.CODE_INVALID, HttpStatus.BAD_REQUEST);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.oneTimeCode.update({ where, data: { consumedAt: new Date() } });
      return this.users.markEmailVerified(userId, tx);
    });
  }

  private async requireUnverifiedUser(userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    if (user.emailVerifiedAt !== null) {
      throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED, HttpStatus.CONFLICT);
    }
    return user;
  }
}

function attemptsExceeded(): AppException {
  return new AppException(ErrorCode.CODE_ATTEMPTS_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS);
}

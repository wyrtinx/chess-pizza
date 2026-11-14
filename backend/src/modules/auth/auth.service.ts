import { randomUUID } from 'node:crypto';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import type { User } from '../../generated/prisma/client.js';
import { maskEmail } from '../mail/mask-email.js';
import { UsersService } from '../users/users.service.js';
import { AccessTokenService } from './access-token.service.js';
import type { AuthTokens } from './auth-cookies.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { EmailVerificationService } from './email-verification.service.js';
import { hashPassword, verifyPassword } from './password.js';
import { resolveLocale } from './resolve-locale.js';
import { SessionsService, type ClientInfo } from './sessions.service.js';

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResult extends AuthResult {
  retryAfter: number;
}

export interface RegisterContext extends ClientInfo {
  acceptLanguage: string | undefined;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Unknown e-mails are checked against this hash so that login time does not reveal them.
  private readonly dummyHash = hashPassword(randomUUID());

  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly accessTokens: AccessTokenService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async register(dto: RegisterDto, context: RegisterContext): Promise<RegisterResult> {
    const user = await this.users.create({
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      name: dto.name,
      locale: dto.locale ?? resolveLocale(context.acceptLanguage),
      termsAcceptedAt: new Date(),
    });
    this.logger.log({ userId: user.id, email: maskEmail(user.email) }, 'User registered');

    const tokens = await this.startSession(user, context);
    const retryAfter = await this.emailVerification.issue(user);
    return { user, tokens, retryAfter };
  }

  async login(dto: LoginDto, client: ClientInfo): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email);
    const valid = await verifyPassword(dto.password, user?.passwordHash ?? (await this.dummyHash));

    if (!user || !valid) {
      this.logger.log({ email: maskEmail(dto.email) }, 'Login failed');
      throw new AppException(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    return { user, tokens: await this.startSession(user, client) };
  }

  async refresh(refreshToken: string | undefined, client: ClientInfo): Promise<AuthResult> {
    if (refreshToken === undefined) {
      throw new AppException(ErrorCode.SESSION_INVALID, HttpStatus.UNAUTHORIZED);
    }

    const rotated = await this.sessions.rotate(refreshToken, client);
    const user = await this.users.findById(rotated.userId);
    if (!user) throw new AppException(ErrorCode.SESSION_INVALID, HttpStatus.UNAUTHORIZED);

    const accessToken = await this.accessTokens.sign({ id: user.id, role: user.role });
    return { user, tokens: { accessToken, refreshToken: rotated.refreshToken } };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken !== undefined) await this.sessions.revoke(refreshToken);
  }

  async findSessionUser(userId: string): Promise<User | null> {
    return this.users.findById(userId);
  }

  private async startSession(user: User, client: ClientInfo): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokens.sign({ id: user.id, role: user.role }),
      this.sessions.start(user.id, client),
    ]);
    return { accessToken, refreshToken };
  }
}

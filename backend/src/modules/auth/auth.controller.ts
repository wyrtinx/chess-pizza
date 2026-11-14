import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { Request, Response } from 'express';

import { ApiErrors } from '../../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { AuthThrottle } from '../../common/throttler/auth-throttle.decorator.js';
import { toUserDto } from '../users/user.mapper.js';
import { AuthCookiesService } from './auth-cookies.service.js';
import {
  LOGIN_THROTTLE,
  REFRESH_TOKEN_COOKIE,
  REGISTER_THROTTLE,
  RESEND_CODE_THROTTLE,
  USER_AGENT_MAX_LENGTH,
  VERIFY_EMAIL_THROTTLE,
} from './auth.constants.js';
import { AuthService } from './auth.service.js';
import { Auth } from './decorators/auth.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { AuthUserResponseDto } from './dto/auth-user-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterResponseDto } from './dto/register-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResendCodeResponseDto } from './dto/resend-code-response.dto.js';
import { SessionResponseDto } from './dto/session-response.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { EmailVerificationService } from './email-verification.service.js';
import { readCookie, type AuthenticatedUser } from './request-user.js';
import type { ClientInfo } from './sessions.service.js';

function clientInfo(req: Request): ClientInfo {
  return { ip: req.ip, userAgent: req.get('user-agent')?.slice(0, USER_AGENT_MAX_LENGTH) };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerification: EmailVerificationService,
    private readonly cookies: AuthCookiesService,
  ) {}

  /**
   * Реєстрація
   *
   * @remarks
   * Створює акаунт, одразу відкриває сесію (cookie `cp_at` і `cp_rt`) і надсилає код підтвердження на пошту.
   * Непідтверджена пошта не заважає входу й замовленням — лише бонусам і знижці першого замовлення.
   * Ліміт — 5 запитів на 15 хв для однієї пошти з однієї IP-адреси.
   */
  @Post('register')
  @AuthThrottle(REGISTER_THROTTLE.limit, REGISTER_THROTTLE.ttl)
  @ApiErrors(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED)
  @ApiErrors(HttpStatus.CONFLICT, ErrorCode.EMAIL_TAKEN)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    const { user, tokens, retryAfter } = await this.authService.register(dto, {
      ...clientInfo(req),
      acceptLanguage: req.get('accept-language'),
    });
    this.cookies.set(res, tokens);
    return { user: toUserDto(user), retryAfter };
  }

  /**
   * Підтвердження пошти кодом
   *
   * @remarks
   * Код із листа діє 10 хв; на один код — 5 спроб, далі потрібен новий код.
   * Ліміт — 10 запитів на 15 хв з однієї IP-адреси.
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @AuthThrottle(VERIFY_EMAIL_THROTTLE.limit, VERIFY_EMAIL_THROTTLE.ttl)
  @ApiErrors(
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.CODE_INVALID,
    ErrorCode.CODE_EXPIRED,
  )
  @ApiErrors(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_VERIFIED)
  @ApiErrors(HttpStatus.TOO_MANY_REQUESTS, ErrorCode.CODE_ATTEMPTS_EXCEEDED, ErrorCode.RATE_LIMITED)
  async verifyEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Body() { code }: VerifyEmailDto,
  ): Promise<AuthUserResponseDto> {
    const verified = await this.emailVerification.verify(user.id, code);
    return { user: toUserDto(verified) };
  }

  /**
   * Надіслати код підтвердження знову
   *
   * @remarks
   * Не частіше ніж раз на 60 с. Новий код замінює попередній.
   * Якщо зарано — `429 RESEND_TOO_SOON` із заголовком `Retry-After` (секунди).
   */
  @Post('verify-email/resend')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @AuthThrottle(RESEND_CODE_THROTTLE.limit, RESEND_CODE_THROTTLE.ttl)
  @ApiErrors(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_VERIFIED)
  @ApiErrors(HttpStatus.TOO_MANY_REQUESTS, ErrorCode.RESEND_TOO_SOON, ErrorCode.RATE_LIMITED)
  async resendCode(@CurrentUser() user: AuthenticatedUser): Promise<ResendCodeResponseDto> {
    return { retryAfter: await this.emailVerification.resend(user.id) };
  }

  /**
   * Вхід
   *
   * @remarks
   * Відкриває нову сесію (cookie `cp_at` і `cp_rt`). Невірна пошта й невірний пароль дають ту саму помилку.
   * Ліміт — 5 запитів на 15 хв для однієї пошти з однієї IP-адреси.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @AuthThrottle(LOGIN_THROTTLE.limit, LOGIN_THROTTLE.ttl)
  @ApiErrors(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED)
  @ApiErrors(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    const { user, tokens } = await this.authService.login(dto, clientInfo(req));
    this.cookies.set(res, tokens);
    return { user: toUserDto(user) };
  }

  /**
   * Оновити сесію
   *
   * @remarks
   * Обмінює refresh-cookie `cp_rt` на нові `cp_at` і `cp_rt`; старий refresh після цього недійсний.
   * Повторне використання старого refresh відкликає всю сесію (`SESSION_REUSED`).
   * Фронтенд має робити один refresh на всі вкладки одночасно.
   * При помилці обидві cookie стираються.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiErrors(HttpStatus.UNAUTHORIZED, ErrorCode.SESSION_INVALID, ErrorCode.SESSION_REUSED)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    try {
      const { user, tokens } = await this.authService.refresh(
        readCookie(req, REFRESH_TOKEN_COOKIE),
        clientInfo(req),
      );
      this.cookies.set(res, tokens);
      return { user: toUserDto(user) };
    } catch (error) {
      this.cookies.clear(res);
      throw error;
    }
  }

  /**
   * Вихід
   *
   * @remarks
   * Відкликає сесію за refresh-cookie і стирає обидві cookie. Діє і з простроченим access-токеном.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logout(readCookie(req, REFRESH_TOKEN_COOKIE));
    this.cookies.clear(res);
  }

  /**
   * Поточна сесія
   *
   * @remarks
   * Для гостя — `{ user: null }` без помилки.
   * `401 TOKEN_EXPIRED` — access-токен прострочений: зробіть `POST /auth/refresh` і повторіть запит.
   */
  @Get('session')
  @Auth({ optional: true })
  async session(
    @CurrentUser({ optional: true }) current: AuthenticatedUser | undefined,
  ): Promise<SessionResponseDto> {
    if (!current) return { user: null };
    const user = await this.authService.findSessionUser(current.id);
    return { user: user ? toUserDto(user) : null };
  }
}

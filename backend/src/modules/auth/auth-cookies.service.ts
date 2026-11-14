import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { CookieOptions, Response } from 'express';

import type { Env } from '../../config/env.js';
import { GLOBAL_PREFIX } from '../../configure-app.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_MS,
} from './auth.constants.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthCookiesService {
  private readonly accessOptions: CookieOptions;
  private readonly refreshOptions: CookieOptions;

  constructor(config: ConfigService<Env, true>) {
    const base: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.get('COOKIE_SECURE', { infer: true }),
    };
    this.accessOptions = { ...base, path: '/' };
    this.refreshOptions = { ...base, path: `/${GLOBAL_PREFIX}/auth` };
  }

  set(res: Response, { accessToken, refreshToken }: AuthTokens): void {
    // The access cookie outlives its 15-minute JWT, so an expired token reaches the API as TOKEN_EXPIRED.
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.accessOptions,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.refreshOptions,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
  }

  clear(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.accessOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.refreshOptions);
  }
}

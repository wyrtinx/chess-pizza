import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Request } from 'express';

import { AppException } from '../../../common/errors/app.exception.js';
import { ErrorCode } from '../../../common/errors/error-code.js';
import { AccessTokenService } from '../access-token.service.js';
import { ACCESS_TOKEN_COOKIE, AUTH_OPTIONAL_METADATA } from '../auth.constants.js';
import { readCookie, setRequestUser } from '../request-user.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly accessTokens: AccessTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const optional =
      this.reflector.getAllAndOverride<boolean | undefined>(AUTH_OPTIONAL_METADATA, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const req = context.switchToHttp().getRequest<Request>();
    const token = readCookie(req, ACCESS_TOKEN_COOKIE);
    if (token === undefined) {
      if (optional) return true;
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    setRequestUser(req, await this.accessTokens.verify(token));
    return true;
  }
}

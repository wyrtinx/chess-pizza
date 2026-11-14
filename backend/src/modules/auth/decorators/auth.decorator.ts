import { applyDecorators, HttpStatus, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';

import { ApiErrors } from '../../../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../../../common/errors/error-code.js';
import { ACCESS_TOKEN_COOKIE, AUTH_OPTIONAL_METADATA } from '../auth.constants.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

interface AuthOptions {
  /** Guests pass too; a present but expired token still answers `TOKEN_EXPIRED`. */
  optional?: boolean;
}

export function Auth({ optional = false }: AuthOptions = {}): MethodDecorator {
  return applyDecorators(
    SetMetadata(AUTH_OPTIONAL_METADATA, optional),
    UseGuards(JwtAuthGuard),
    ApiCookieAuth(ACCESS_TOKEN_COOKIE),
    ApiErrors(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED),
  );
}

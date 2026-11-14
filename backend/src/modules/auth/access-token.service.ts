import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { Role } from '../../generated/prisma/enums.js';
import type { AuthenticatedUser } from './request-user.js';

const ROLES = new Set<unknown>(Object.values(Role));

function isRole(value: unknown): value is Role {
  return ROLES.has(value);
}

@Injectable()
export class AccessTokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(user: AuthenticatedUser): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, role: user.role });
  }

  /** Throws `TOKEN_EXPIRED` for an expired token and `UNAUTHORIZED` for any other bad token. */
  async verify(token: string): Promise<AuthenticatedUser> {
    let payload: object;
    try {
      payload = await this.jwt.verifyAsync<object>(token);
    } catch (error) {
      const code =
        error instanceof TokenExpiredError ? ErrorCode.TOKEN_EXPIRED : ErrorCode.UNAUTHORIZED;
      throw new AppException(code, HttpStatus.UNAUTHORIZED);
    }

    const id: unknown = Reflect.get(payload, 'sub');
    const role: unknown = Reflect.get(payload, 'role');
    if (typeof id !== 'string' || !isRole(role)) {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return { id, role };
  }
}

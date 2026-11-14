import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Request } from 'express';

import { AppException } from '../../../common/errors/app.exception.js';
import { ErrorCode } from '../../../common/errors/error-code.js';
import type { Role } from '../../../generated/prisma/enums.js';
import { ROLES_METADATA } from '../auth.constants.js';
import { getRequestUser } from '../request-user.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const user = getRequestUser(context.switchToHttp().getRequest<Request>());
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    if (!roles.includes(user.role)) {
      throw new AppException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
    }
    return true;
  }
}

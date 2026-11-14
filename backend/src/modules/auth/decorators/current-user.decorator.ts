import { createParamDecorator, HttpStatus, type ExecutionContext } from '@nestjs/common';

import type { Request } from 'express';

import { AppException } from '../../../common/errors/app.exception.js';
import { ErrorCode } from '../../../common/errors/error-code.js';
import { getRequestUser, type AuthenticatedUser } from '../request-user.js';

interface CurrentUserOptions {
  /** For `@Auth({ optional: true })` routes: `undefined` for a guest. */
  optional?: boolean;
}

export const CurrentUser = createParamDecorator(
  (
    options: CurrentUserOptions | undefined,
    context: ExecutionContext,
  ): AuthenticatedUser | undefined => {
    const user = getRequestUser(context.switchToHttp().getRequest<Request>());
    if (!user && !options?.optional) {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return user;
  },
);

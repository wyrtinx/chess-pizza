import { createParamDecorator, HttpStatus, type ExecutionContext } from '@nestjs/common';

import type { Request } from 'express';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { IDEMPOTENCY_KEY_HEADER, IDEMPOTENCY_KEY_PATTERN } from './orders.constants.js';

export const IdempotencyKey = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const key = context.switchToHttp().getRequest<Request>().get(IDEMPOTENCY_KEY_HEADER)?.trim();
    if (key === undefined || !IDEMPOTENCY_KEY_PATTERN.test(key)) {
      throw new AppException(ErrorCode.IDEMPOTENCY_KEY_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return key;
  },
);

import type { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception.js';
import type { ErrorCode } from './error-code.js';

/** The filter turns `retryAfterSeconds` into the `Retry-After` header. */
export class RetryAfterException extends AppException {
  constructor(
    code: ErrorCode,
    status: HttpStatus,
    readonly retryAfterSeconds: number,
  ) {
    super(code, status);
  }
}

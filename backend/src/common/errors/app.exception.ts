import { HttpException, type HttpStatus } from '@nestjs/common';

import { messageFromCode, type ErrorCode } from './error-code.js';

export interface ErrorDetail {
  field: string;
  code: ErrorCode;
}

export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    status: HttpStatus,
    readonly details?: ErrorDetail[],
  ) {
    super(messageFromCode(code), status);
  }
}

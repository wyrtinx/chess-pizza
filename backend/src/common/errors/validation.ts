import { HttpStatus, ValidationPipe, type ValidationError } from '@nestjs/common';

import { AppException, type ErrorDetail } from './app.exception.js';
import { ErrorCode, isErrorCode } from './error-code.js';

const WHITELIST_RULE = 'whitelistValidation';

export function flattenValidationErrors(errors: ValidationError[], parentPath = ''): ErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath === '' ? error.property : `${parentPath}.${error.property}`;
    const [failed] = Object.entries(error.constraints ?? {});
    const own = failed ? [{ field, code: toErrorCode(...failed) }] : [];

    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });
}

function toErrorCode(rule: string, message: string): ErrorCode {
  if (rule === WHITELIST_RULE) return ErrorCode.UNKNOWN_FIELD;
  return isErrorCode(message) ? message : ErrorCode.INVALID;
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) =>
      new AppException(
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        flattenValidationErrors(errors),
      ),
  });
}

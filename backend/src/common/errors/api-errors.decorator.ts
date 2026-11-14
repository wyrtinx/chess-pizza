import type { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import type { ErrorCode } from './error-code.js';
import { ErrorResponseDto } from './error-response.dto.js';

/** One call per status: a second call with the same status replaces the first. */
export function ApiErrors(status: HttpStatus, ...codes: ErrorCode[]): MethodDecorator {
  return ApiResponse({
    status,
    type: ErrorResponseDto,
    description: codes.map((code) => `\`${code}\``).join(' · '),
  });
}

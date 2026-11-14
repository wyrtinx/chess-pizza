import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import { Prisma } from '../../generated/prisma/client.js';
import { getRequestId } from '../request-id/request-id.middleware.js';
import { AppException, type ErrorDetail } from './app.exception.js';
import { ErrorCode, messageFromCode } from './error-code.js';
import type { ErrorResponseDto } from './error-response.dto.js';
import { RetryAfterException } from './retry-after.exception.js';

interface ResolvedError {
  status: number;
  code: ErrorCode;
  message: string;
  details?: ErrorDetail[];
}

const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
};

const PRISMA_ERRORS: Partial<Record<string, { status: HttpStatus; code: ErrorCode }>> = {
  P2002: { status: HttpStatus.CONFLICT, code: ErrorCode.CONFLICT },
  P2025: { status: HttpStatus.NOT_FOUND, code: ErrorCode.NOT_FOUND },
};

function fromCode(status: number, code: ErrorCode): ResolvedError {
  return { status, code, message: messageFromCode(code) };
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    if (response.headersSent) return;

    const { status, code, message, details } = this.resolve(exception);
    const body: ErrorResponseDto = {
      statusCode: status,
      code,
      message,
      ...(details && { details }),
      requestId: getRequestId(http.getRequest<Request>()),
    };

    if (exception instanceof RetryAfterException) {
      response.setHeader('Retry-After', String(exception.retryAfterSeconds));
    }
    response.status(status).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status < 500) {
        return {
          status,
          code: CODE_BY_STATUS[status] ?? ErrorCode.VALIDATION_FAILED,
          message: exception.message,
        };
      }

      this.logger.error(exception);
      return fromCode(status, ErrorCode.INTERNAL_ERROR);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const known = PRISMA_ERRORS[exception.code];
      if (known) return fromCode(known.status, known.code);
    }

    this.logger.error(exception);
    return fromCode(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
  }
}

import { HttpStatus, Injectable, type ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerLimitDetail } from '@nestjs/throttler';

import { AppException } from '../errors/app.exception.js';
import { ErrorCode } from '../errors/error-code.js';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    // The base guard names the header after the throttler ("Retry-After-auth").
    const { res } = this.getRequestResponse(context);
    this.setResponseHeader(res, 'Retry-After', detail.timeToBlockExpire);

    throw new AppException(ErrorCode.RATE_LIMITED, HttpStatus.TOO_MANY_REQUESTS);
  }
}

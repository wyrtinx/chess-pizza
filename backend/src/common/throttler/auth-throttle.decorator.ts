import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AUTH_THROTTLE_METADATA, AUTH_THROTTLER } from './throttler.config.js';

export function AuthThrottle(limit: number, ttl: number): MethodDecorator {
  return applyDecorators(
    SetMetadata(AUTH_THROTTLE_METADATA, true),
    Throttle({ [AUTH_THROTTLER]: { limit, ttl } }),
  );
}

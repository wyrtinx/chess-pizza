import { minutes, type ThrottlerModuleOptions } from '@nestjs/throttler';

export const AUTH_THROTTLER = 'auth';
export const AUTH_THROTTLE_METADATA = 'throttler:auth-enabled';

export const throttlerOptions: ThrottlerModuleOptions = {
  throttlers: [
    { name: 'default', ttl: minutes(1), limit: 100 },
    {
      name: AUTH_THROTTLER,
      ttl: minutes(15),
      limit: 5,
      // A named throttler applies to every route; this one is opt-in via @AuthThrottle().
      skipIf: (context) => !Reflect.hasMetadata(AUTH_THROTTLE_METADATA, context.getHandler()),
    },
  ],
};

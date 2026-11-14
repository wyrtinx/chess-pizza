import { minutes, normalizeIp, type ThrottlerModuleOptions } from '@nestjs/throttler';

export const AUTH_THROTTLER = 'auth';
export const AUTH_THROTTLE_METADATA = 'throttler:auth-enabled';

// The guard runs before validation, so the body is still untrusted here.
function accountEmail(req: Record<string, unknown>): string {
  const body: unknown = req.body;
  const email: unknown =
    typeof body === 'object' && body !== null ? Reflect.get(body, 'email') : undefined;
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function clientIp(req: Record<string, unknown>): string {
  return typeof req.ip === 'string' ? normalizeIp(req.ip) : '';
}

export const throttlerOptions: ThrottlerModuleOptions = {
  throttlers: [
    { name: 'default', ttl: minutes(1), limit: 100 },
    {
      name: AUTH_THROTTLER,
      ttl: minutes(15),
      limit: 5,
      // A named throttler applies to every route; this one is opt-in via @AuthThrottle().
      skipIf: (context) => !Reflect.hasMetadata(AUTH_THROTTLE_METADATA, context.getHandler()),
      // Per account and IP, so that one client cannot lock an account for everyone else.
      getTracker: (req) => `${accountEmail(req)}|${clientIp(req)}`,
    },
  ],
};

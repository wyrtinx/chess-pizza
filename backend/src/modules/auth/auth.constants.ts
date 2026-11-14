import { days, minutes } from '@nestjs/throttler';

export const ACCESS_TOKEN_COOKIE = 'cp_at';
export const REFRESH_TOKEN_COOKIE = 'cp_rt';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = days(30);

export const VERIFICATION_CODE_TTL_MINUTES = 10;
export const VERIFICATION_CODE_MAX_ATTEMPTS = 5;
export const VERIFICATION_CODE_RESEND_SECONDS = 60;

export const REGISTER_THROTTLE = { limit: 5, ttl: minutes(15) };
export const LOGIN_THROTTLE = { limit: 5, ttl: minutes(15) };
export const VERIFY_EMAIL_THROTTLE = { limit: 10, ttl: minutes(15) };
export const RESEND_CODE_THROTTLE = { limit: 5, ttl: minutes(15) };

export const USER_AGENT_MAX_LENGTH = 512;

export const AUTH_OPTIONAL_METADATA = 'auth:optional';
export const ROLES_METADATA = 'auth:roles';

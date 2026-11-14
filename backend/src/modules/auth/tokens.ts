import { createHash, randomBytes, randomInt } from 'node:crypto';

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function generateVerificationCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

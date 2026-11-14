export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
// Caps the argon2 input so a huge password cannot be used to burn CPU.
export const PASSWORD_MAX_LENGTH = 128;

// SPEC 3.8: the format is "x@y.z", not full RFC 5322.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

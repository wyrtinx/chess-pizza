import {
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  normalizeEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../src/modules/users/user-fields.js';

export interface AdminSeed {
  email: string;
  password: string;
  name: string;
}

function required(key: string): string {
  const value = process.env[key]?.trim();
  if (!value)
    throw new Error(
      `${key} is not set: the seed creates the admin from ADMIN_* (see .env.example)`,
    );
  return value;
}

export function readAdminSeed(): AdminSeed {
  const email = normalizeEmail(required('ADMIN_EMAIL'));
  const password = required('ADMIN_PASSWORD');
  const name = required('ADMIN_NAME');

  if (!EMAIL_PATTERN.test(email) || email.length > EMAIL_MAX_LENGTH) {
    throw new Error('ADMIN_EMAIL is not a valid e-mail');
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`,
    );
  }
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    throw new Error(`ADMIN_NAME must be ${NAME_MIN_LENGTH}-${NAME_MAX_LENGTH} characters`);
  }

  return { email, password, name };
}

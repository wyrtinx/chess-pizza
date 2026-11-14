import type { TransformFnParams } from 'class-transformer';

import { normalizeEmail } from '../../users/user-fields.js';

export function normalizeEmailInput({ value }: TransformFnParams): unknown {
  const raw: unknown = value;
  return typeof raw === 'string' ? normalizeEmail(raw) : raw;
}

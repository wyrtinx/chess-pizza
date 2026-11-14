import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { Env } from './env.js';

/**
 * `validate` hook for `ConfigModule.forRoot`. Converts raw strings to the types
 * declared in `Env` and throws when a variable is missing or malformed.
 * The error lists variable names and rules only, never the values.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(Env, raw, { enableImplicitConversion: true });

  const errors = validateSync(env, {
    skipMissingProperties: false,
    validationError: { target: false, value: false },
  });

  if (errors.length > 0) {
    const problems = errors.map((error) => {
      const rules = Object.keys(error.constraints ?? {}).join(', ');
      return `${error.property} (${rules})`;
    });
    throw new Error(`Invalid environment variables: ${problems.join('; ')}`);
  }

  return env;
}

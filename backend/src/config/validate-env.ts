import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { Env } from './env.js';

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

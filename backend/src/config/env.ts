import { Transform, type TransformFnParams } from 'class-transformer';
import { ArrayNotEmpty, IsBoolean, IsIn, IsInt, Matches, Max, Min } from 'class-validator';

export const NODE_ENVS = ['development', 'test', 'production'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

// `value` arrives already coerced by enableImplicitConversion ("false" -> true), so read the source.
const rawValue = ({ obj, key }: TransformFnParams): unknown => {
  const source: unknown = obj;
  return typeof source === 'object' && source !== null ? Reflect.get(source, key) : undefined;
};

export class Env {
  @IsIn(NODE_ENVS)
  NODE_ENV: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @Matches(/^postgres(ql)?:\/\/.+/)
  DATABASE_URL: string;

  @Transform((params) => {
    const raw = rawValue(params);
    return typeof raw === 'string' ?
        raw
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin !== '')
      : raw;
  })
  @ArrayNotEmpty()
  @Matches(/^https?:\/\/[^/\s]+$/, { each: true })
  CORS_ORIGINS: string[];

  @IsInt()
  @Min(0)
  TRUST_PROXY: number = 0;

  @Transform((params) => {
    const raw = rawValue(params);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return raw;
  })
  @IsBoolean()
  DOCS_ENABLED: boolean = false;

  @IsIn(LOG_LEVELS)
  LOG_LEVEL: LogLevel = 'info';

  @Matches(/^\d+(b|kb|mb)$/i)
  BODY_LIMIT: string = '100kb';
}

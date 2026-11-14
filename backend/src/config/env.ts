import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateBy,
  ValidateIf,
} from 'class-validator';

export const NODE_ENVS = ['development', 'test', 'production'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

// `value` arrives already coerced by enableImplicitConversion ("false" -> true), so read the source.
const rawValue = ({ obj, key }: TransformFnParams): unknown => {
  const source: unknown = obj;
  return typeof source === 'object' && source !== null ? Reflect.get(source, key) : undefined;
};

const toBoolean = (params: TransformFnParams): unknown => {
  const raw = rawValue(params);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return raw;
};

const emptyToUndefined = (params: TransformFnParams): unknown => {
  const raw = rawValue(params);
  return raw === '' ? undefined : raw;
};

// Credentials are optional for Mailpit, but Gmail in production needs them.
const isSmtpAuthRequired = (env: Env): boolean =>
  env.NODE_ENV === 'production' || env.SMTP_USER !== undefined || env.SMTP_PASS !== undefined;

// Auth cookies must never travel over plain HTTP in production.
const TrueInProduction = (): PropertyDecorator =>
  ValidateBy({
    name: 'trueInProduction',
    validator: {
      validate: (value, args) =>
        Reflect.get(args?.object ?? {}, 'NODE_ENV') !== 'production' || value === true,
    },
  });

const MAIL_FROM_PATTERN =
  /^(?:[^<>]+ <[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;

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

  @Transform(toBoolean)
  @IsBoolean()
  DOCS_ENABLED: boolean = false;

  @IsIn(LOG_LEVELS)
  LOG_LEVEL: LogLevel = 'info';

  @Matches(/^\d+(b|kb|mb)$/i)
  BODY_LIMIT: string = '100kb';

  @IsString()
  @IsNotEmpty()
  SMTP_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT: number;

  @Transform(toBoolean)
  @IsBoolean()
  SMTP_SECURE: boolean = false;

  @Transform(emptyToUndefined)
  @ValidateIf(isSmtpAuthRequired)
  @IsString()
  @IsNotEmpty()
  SMTP_USER?: string;

  @Transform(emptyToUndefined)
  @ValidateIf(isSmtpAuthRequired)
  @IsString()
  @IsNotEmpty()
  SMTP_PASS?: string;

  @Matches(MAIL_FROM_PATTERN)
  MAIL_FROM: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @Transform(toBoolean)
  @IsBoolean()
  @TrueInProduction()
  COOKIE_SECURE: boolean = false;
}

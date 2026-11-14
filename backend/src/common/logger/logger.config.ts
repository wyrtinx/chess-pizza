import type { ConfigService } from '@nestjs/config';

import type { Request, Response } from 'express';
import type { Params } from 'nestjs-pino';
import type { SerializedResponse } from 'pino';

import type { Env } from '../../config/env.js';

const HEALTH_PATH = '/api/v1/health';

export function createLoggerParams(config: ConfigService<Env, true>): Params<Request, Response> {
  const isDevelopment = config.get('NODE_ENV', { infer: true }) === 'development';

  return {
    pinoHttp: {
      level: config.get('LOG_LEVEL', { infer: true }),
      redact: ['req.headers.cookie', 'req.headers.authorization'],
      // Response headers are not logged at all, so Set-Cookie cannot leak.
      serializers: { res: ({ statusCode }: SerializedResponse) => ({ statusCode }) },
      autoLogging: { ignore: (req) => req.originalUrl.split('?')[0] === HEALTH_PATH },
      transport:
        isDevelopment ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
    },
  };
}

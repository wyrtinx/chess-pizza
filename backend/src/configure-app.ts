import { join } from 'node:path';

import type { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppExceptionFilter } from './common/errors/app-exception.filter.js';
import { createValidationPipe } from './common/errors/validation.js';
import { setupDocs } from './common/openapi/setup-docs.js';
import {
  REQUEST_ID_HEADER,
  requestIdMiddleware,
} from './common/request-id/request-id.middleware.js';
import type { Env } from './config/env.js';

export const GLOBAL_PREFIX = 'api/v1';
const PUBLIC_FILES_PATH = 'files';
const PUBLIC_FILES_DIR = join(import.meta.dirname, '..', 'assets');

// bodyParser is off so that configureApp registers the JSON parser alone, with BODY_LIMIT.
export const APP_OPTIONS: NestApplicationOptions = { bufferLogs: true, bodyParser: false };

export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.useLogger(app.get(Logger));
  app.set('trust proxy', config.get('TRUST_PROXY', { infer: true }));

  app.use(requestIdMiddleware, helmet(), cookieParser());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER, 'Retry-After'],
  });
  app.useBodyParser('json', { limit: config.get('BODY_LIMIT', { infer: true }) });
  app.useStaticAssets(PUBLIC_FILES_DIR, {
    prefix: `/${PUBLIC_FILES_PATH}/`,
    index: false,
    maxAge: '1d',
    // helmet allows same-origin only; product photos are shown on the frontend's origin.
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  });

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new AppExceptionFilter());
  app.enableShutdownHooks();

  if (config.get('DOCS_ENABLED', { infer: true })) setupDocs(app);
}

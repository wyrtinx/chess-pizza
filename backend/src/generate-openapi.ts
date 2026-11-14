import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { createOpenApiDocument } from './common/openapi/openapi-document.js';
import { APP_OPTIONS, configureApp } from './configure-app.js';

const OUTPUT_PATH = join(import.meta.dirname, '..', 'openapi.json');

const app = await NestFactory.create<NestExpressApplication>(AppModule, APP_OPTIONS);
configureApp(app);

await Bun.write(OUTPUT_PATH, `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`);
await app.close();

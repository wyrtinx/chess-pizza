import type { Type } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModuleBuilder } from '@nestjs/testing';

import { AppModule } from '../src/app.module.js';
import { APP_OPTIONS, configureApp } from '../src/configure-app.js';

interface TestAppOptions {
  controllers?: Type[];
  customize?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
}

export async function createTestApp({
  controllers = [],
  customize = (builder) => builder,
}: TestAppOptions = {}): Promise<NestExpressApplication> {
  const builder = Test.createTestingModule({ imports: [AppModule], controllers });
  const moduleRef = await customize(builder).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>(APP_OPTIONS);
  configureApp(app);
  await app.init();

  return app;
}

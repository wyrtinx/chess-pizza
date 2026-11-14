import type { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = 'api/v1';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.enableShutdownHooks();
}

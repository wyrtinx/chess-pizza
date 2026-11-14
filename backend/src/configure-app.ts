import type { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX = 'api/v1';

/**
 * Application-wide HTTP setup shared by `main.ts` and smoke tests,
 * so tests exercise the same routes and behaviour as the real server.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.enableShutdownHooks();
}

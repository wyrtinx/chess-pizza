import type { NestExpressApplication } from '@nestjs/platform-express';

import { apiReference } from '@scalar/nestjs-api-reference';
import { contentSecurityPolicy } from 'helmet';

import { createOpenApiDocument } from './openapi-document.js';

export const DOCS_PATH = '/docs';

const SCALAR_CDN = 'https://cdn.jsdelivr.net';

export function setupDocs(app: NestExpressApplication): void {
  app.use(
    DOCS_PATH,
    contentSecurityPolicy({
      directives: {
        scriptSrc: ["'self'", "'unsafe-inline'", SCALAR_CDN],
      },
    }),
    apiReference({
      content: createOpenApiDocument(app),
      telemetry: false,
      agent: { disabled: true },
      showDeveloperTools: 'never',
    }),
  );
}

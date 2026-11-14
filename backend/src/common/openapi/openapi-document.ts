import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

import { ACCESS_TOKEN_COOKIE } from '../../modules/auth/auth.constants.js';

const DESCRIPTION = [
  'API сайту Chess Pizza: вітрина, кошик, оформлення, профіль із бонусами, адмін-панель.',
  '',
  'Гроші — цілі числа в копійках, дати — ISO 8601 в UTC.',
  '',
  'Усі помилки мають один формат (`ErrorResponseDto`): машинний `code`, для помилок полів — `details`, і `requestId`, що збігається із заголовком `X-Request-Id`.',
  'Будь-який ендпоінт може відповісти `429 RATE_LIMITED` (із заголовком `Retry-After`) і `500 INTERNAL_ERROR`.',
].join('\n');

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Chess Pizza API')
    .setDescription(DESCRIPTION)
    .setVersion('1')
    .addCookieAuth(ACCESS_TOKEN_COOKIE)
    .build();

  return SwaggerModule.createDocument(app, config);
}

import type { Prisma } from '../../generated/prisma/client.js';
import type { LocalizedTextDto } from './localized-text.dto.js';

function isJsonObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toLocalizedText(value: Prisma.JsonValue): LocalizedTextDto {
  if (!isJsonObject(value) || typeof value.uk !== 'string') {
    throw new TypeError('Localized text must be an object with a string "uk"');
  }

  return typeof value.en === 'string' ? { uk: value.uk, en: value.en } : { uk: value.uk };
}

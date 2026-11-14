import { Locale } from '../../generated/prisma/enums.js';

// SPEC 3.11: the browser language decides, uk / ru / be → Ukrainian, anything else → English.
const UKRAINIAN_FOR = new Set(['uk', 'ru', 'be']);

export function resolveLocale(acceptLanguage: string | undefined): Locale {
  const preferred = acceptLanguage?.split(',')[0]?.split(';')[0]?.trim().split('-')[0];
  return preferred !== undefined && UKRAINIAN_FOR.has(preferred.toLowerCase()) ?
      Locale.uk
    : Locale.en;
}

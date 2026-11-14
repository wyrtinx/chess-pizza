const SEPARATORS = /[\s\-()]/g;
const UA_INTERNATIONAL = /^\+380\d{9}$/;
const UA_NATIONAL = /^0\d{9}$/;

/** `+380XXXXXXXXX` or `0XXXXXXXXX` with spaces, dashes and brackets → E.164, otherwise `null`. */
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replaceAll(SEPARATORS, '');

  if (UA_INTERNATIONAL.test(compact)) return compact;
  if (UA_NATIONAL.test(compact)) return `+38${compact}`;
  return null;
}

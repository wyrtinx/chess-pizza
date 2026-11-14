import { isUUID } from 'class-validator';

export interface CursorPayload {
  createdAt: Date;
  id: string;
}

export function encodeCursor({ createdAt, id }: CursorPayload): string {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString(
    'base64url',
  );
}

export function decodeCursor(cursor: string): CursorPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const createdAt: unknown = Reflect.get(parsed, 'createdAt');
  const id: unknown = Reflect.get(parsed, 'id');
  if (typeof createdAt !== 'string' || typeof id !== 'string' || !isUUID(id)) return null;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return { createdAt: date, id };
}

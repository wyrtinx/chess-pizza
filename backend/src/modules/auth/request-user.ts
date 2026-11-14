import type { Request } from 'express';

import type { Role } from '../../generated/prisma/enums.js';

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

const users = new WeakMap<Request, AuthenticatedUser>();

export function setRequestUser(req: Request, user: AuthenticatedUser): void {
  users.set(req, user);
}

export function getRequestUser(req: Request): AuthenticatedUser | undefined {
  return users.get(req);
}

export function readCookie(req: Request, name: string): string | undefined {
  const cookies: unknown = req.cookies;
  const value: unknown =
    typeof cookies === 'object' && cookies !== null ? Reflect.get(cookies, name) : undefined;
  return typeof value === 'string' && value !== '' ? value : undefined;
}

import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'X-Request-Id';

const VALID_REQUEST_ID = /^[\w-]{1,64}$/;

// Runs before the body parser, so parser errors carry an id too; pino-http keeps an existing req.id.
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get(REQUEST_ID_HEADER);
  const id = incoming !== undefined && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();

  req.id = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}

export function getRequestId(req: Request): string {
  return typeof req.id === 'string' ? req.id : '';
}

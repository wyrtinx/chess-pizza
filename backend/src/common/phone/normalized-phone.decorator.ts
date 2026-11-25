import { applyDecorators } from '@nestjs/common';

import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

import { ErrorCode } from '../errors/error-code.js';
import { normalizePhone } from './normalize-phone.js';

const E164_UA = /^\+380\d{9}$/;

/** Accepts `+380XXXXXXXXX` / `0XXXXXXXXX` with separators and turns it into E.164. */
export function NormalizedPhone(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? (normalizePhone(value) ?? value) : value,
    ),
    // class-validator runs these bottom-up: the type check must stay last.
    Matches(E164_UA, { message: ErrorCode.PHONE_INVALID }),
    IsString({ message: ErrorCode.PHONE_INVALID }),
  );
}

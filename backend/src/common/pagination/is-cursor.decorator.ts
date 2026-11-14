import { ValidateBy } from 'class-validator';

import { ErrorCode } from '../errors/error-code.js';
import { decodeCursor } from './cursor.js';

export function IsCursor(): PropertyDecorator {
  return ValidateBy({
    name: 'isCursor',
    validator: {
      validate: (value) => typeof value === 'string' && decodeCursor(value) !== null,
      defaultMessage: () => ErrorCode.CURSOR_INVALID,
    },
  });
}

import { describe, expect, it } from 'bun:test';

import type { ValidationError } from '@nestjs/common';

import { ErrorCode } from './error-code.js';
import { flattenValidationErrors } from './validation.js';

describe('flattenValidationErrors', () => {
  it('maps a validator message to its error code', () => {
    const errors: ValidationError[] = [
      { property: 'email', constraints: { isEmail: 'EMAIL_INVALID' } },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'email', code: ErrorCode.EMAIL_INVALID },
    ]);
  });

  it('builds dotted paths for nested objects and arrays', () => {
    const errors: ValidationError[] = [
      {
        property: 'items',
        children: [
          {
            property: '0',
            children: [{ property: 'quantity', constraints: { min: 'QUANTITY_INVALID' } }],
          },
        ],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'items.0.quantity', code: ErrorCode.QUANTITY_INVALID },
    ]);
  });

  it('reports a non-whitelisted property as UNKNOWN_FIELD', () => {
    const errors: ValidationError[] = [
      {
        property: 'isAdmin',
        constraints: { whitelistValidation: 'property isAdmin should not exist' },
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'isAdmin', code: ErrorCode.UNKNOWN_FIELD },
    ]);
  });

  it('falls back to INVALID when a validator has no error code', () => {
    const errors: ValidationError[] = [
      { property: 'age', constraints: { isInt: 'age must be an integer number' } },
    ];

    expect(flattenValidationErrors(errors)).toEqual([{ field: 'age', code: ErrorCode.INVALID }]);
  });

  it('keeps one code per field', () => {
    const errors: ValidationError[] = [
      { property: 'name', constraints: { minLength: 'NAME_TOO_SHORT', isString: 'NAME_REQUIRED' } },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'name', code: ErrorCode.NAME_TOO_SHORT },
    ]);
  });
});

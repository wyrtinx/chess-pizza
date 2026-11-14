import { applyDecorators, HttpStatus, SetMetadata, UseGuards } from '@nestjs/common';

import { ApiErrors } from '../../../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../../../common/errors/error-code.js';
import type { Role } from '../../../generated/prisma/enums.js';
import { ROLES_METADATA } from '../auth.constants.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Auth } from './auth.decorator.js';

/** Includes `@Auth()`: the user must be signed in and have one of the roles. */
export function Roles(...roles: Role[]): MethodDecorator {
  return applyDecorators(
    Auth(),
    SetMetadata(ROLES_METADATA, roles),
    UseGuards(RolesGuard),
    ApiErrors(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN),
  );
}

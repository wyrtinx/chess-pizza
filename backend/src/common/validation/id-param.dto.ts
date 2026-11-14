import { IsUUID } from 'class-validator';

import { ErrorCode } from '../errors/error-code.js';

export class IdParamDto {
  /**
   * Ідентифікатор (UUID).
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  @IsUUID(undefined, { message: ErrorCode.INVALID })
  id: string;
}

import { IsString, Matches } from 'class-validator';

import { ErrorCode } from '../../../common/errors/error-code.js';

export class VerifyEmailDto {
  /**
   * Шестизначний код із листа.
   * @example "482913"
   */
  @IsString({ message: ErrorCode.CODE_FORMAT_INVALID })
  @Matches(/^\d{6}$/, { message: ErrorCode.CODE_FORMAT_INVALID })
  code: string;
}

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

import { ErrorCode } from '../../../common/errors/error-code.js';
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, PASSWORD_MAX_LENGTH } from '../../users/user-fields.js';
import { normalizeEmailInput } from './normalize-email-input.js';

export class LoginDto {
  /**
   * E-mail акаунта (регістр не важливий).
   * @example "olena@example.com"
   */
  @Transform(normalizeEmailInput)
  @IsString({ message: ErrorCode.EMAIL_INVALID })
  @Matches(EMAIL_PATTERN, { message: ErrorCode.EMAIL_INVALID })
  @MaxLength(EMAIL_MAX_LENGTH, { message: ErrorCode.EMAIL_INVALID })
  email: string;

  /**
   * Пароль.
   * @example "pizza-lover-42"
   */
  // class-validator runs these bottom-up: the type check must stay last.
  @MaxLength(PASSWORD_MAX_LENGTH, { message: ErrorCode.INVALID })
  @IsNotEmpty({ message: ErrorCode.REQUIRED })
  @IsString({ message: ErrorCode.REQUIRED })
  password: string;
}

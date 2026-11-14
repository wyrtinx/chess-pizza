import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { Equals, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { ErrorCode } from '../../../common/errors/error-code.js';
import { trimString } from '../../../common/validation/trim.js';
import { Locale } from '../../../generated/prisma/enums.js';
import {
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../users/user-fields.js';
import { normalizeEmailInput } from './normalize-email-input.js';

export class RegisterDto {
  /**
   * Ім’я, від 2 до 100 символів (пробіли по краях обрізаються).
   * @example "Олена"
   */
  // class-validator runs these bottom-up: the type check must stay last.
  @Transform(trimString)
  @MaxLength(NAME_MAX_LENGTH, { message: ErrorCode.INVALID })
  @MinLength(NAME_MIN_LENGTH, { message: ErrorCode.NAME_TOO_SHORT })
  @IsString({ message: ErrorCode.NAME_TOO_SHORT })
  name: string;

  /**
   * E-mail у форматі `x@y.z`, до 254 символів. Зберігається в нижньому регістрі.
   * @example "olena@example.com"
   */
  @Transform(normalizeEmailInput)
  @IsString({ message: ErrorCode.EMAIL_INVALID })
  @Matches(EMAIL_PATTERN, { message: ErrorCode.EMAIL_INVALID })
  @MaxLength(EMAIL_MAX_LENGTH, { message: ErrorCode.EMAIL_INVALID })
  email: string;

  /**
   * Пароль, від 8 до 128 символів.
   * @example "pizza-lover-42"
   */
  @MaxLength(PASSWORD_MAX_LENGTH, { message: ErrorCode.INVALID })
  @MinLength(PASSWORD_MIN_LENGTH, { message: ErrorCode.PASSWORD_TOO_SHORT })
  @IsString({ message: ErrorCode.PASSWORD_TOO_SHORT })
  password: string;

  /** Згода з умовами сервісу — має бути `true`. */
  @Equals(true, { message: ErrorCode.TERMS_NOT_ACCEPTED })
  termsAccepted: boolean;

  /** Мова листів. Якщо не вказана — за заголовком `Accept-Language` (`uk`, `ru`, `be` → `uk`, інакше `en`). */
  @ApiProperty({ enum: Locale, enumName: 'Locale', required: false })
  @IsOptional()
  @IsIn(Object.values(Locale), { message: ErrorCode.INVALID })
  locale?: Locale;
}

import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { ErrorCode } from '../../../common/errors/error-code.js';
import { NormalizedPhone } from '../../../common/phone/normalized-phone.decorator.js';
import { trimString } from '../../../common/validation/trim.js';
import { Fulfillment } from '../../../generated/prisma/enums.js';
import {
  ADDRESS_MAX_LENGTH,
  ADDRESS_MIN_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NAME_MIN_LENGTH,
  COURIER_COMMENT_MAX_LENGTH,
} from '../orders.constants.js';
import { QuoteOrderDto } from './quote-order.dto.js';

const HAS_HOUSE_NUMBER = /\d/;

export class CreateOrderDto extends QuoteOrderDto {
  /**
   * Ім’я отримувача, від 2 до 100 символів.
   * @example "Олена"
   */
  // class-validator runs these bottom-up: the type check must stay last.
  @Transform(trimString)
  @MaxLength(CONTACT_NAME_MAX_LENGTH, { message: ErrorCode.INVALID })
  @MinLength(CONTACT_NAME_MIN_LENGTH, { message: ErrorCode.NAME_TOO_SHORT })
  @IsString({ message: ErrorCode.NAME_TOO_SHORT })
  name: string;

  /**
   * Телефон: `+380XXXXXXXXX` або `0XXXXXXXXX`, можна з пробілами, дефісами й дужками.
   * У відповіді — у форматі E.164.
   * @example "+380 67 123 45 67"
   */
  @NormalizedPhone()
  phone: string;

  /**
   * Адреса доставки: від 5 символів і з номером будинку. Обов’язкова для доставки, для самовивозу ігнорується.
   * @example "вул. Хрещатик, 22, кв. 5"
   */
  @ValidateIf((dto: CreateOrderDto) => dto.fulfillment === Fulfillment.DELIVERY)
  @Transform(trimString)
  @Matches(HAS_HOUSE_NUMBER, { message: ErrorCode.ADDRESS_INVALID })
  @MaxLength(ADDRESS_MAX_LENGTH, { message: ErrorCode.ADDRESS_INVALID })
  @MinLength(ADDRESS_MIN_LENGTH, { message: ErrorCode.ADDRESS_INVALID })
  @IsString({ message: ErrorCode.ADDRESS_INVALID })
  address?: string;

  /**
   * Коментар кур’єру (під’їзд, поверх, домофон), до 500 символів. Лише для доставки.
   * @example "Домофон 5, третій поверх"
   */
  @IsOptional()
  @Transform(trimString)
  @MaxLength(COURIER_COMMENT_MAX_LENGTH, { message: ErrorCode.INVALID })
  @IsString({ message: ErrorCode.INVALID })
  courierComment?: string;

  /**
   * Піцерія для самовивозу (`GET /pizzerias`). Обов’язкова для самовивозу, для доставки ігнорується.
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  @ValidateIf((dto: CreateOrderDto) => dto.fulfillment === Fulfillment.PICKUP)
  @IsUUID(undefined, { message: ErrorCode.PIZZERIA_REQUIRED })
  pizzeriaId?: string;
}

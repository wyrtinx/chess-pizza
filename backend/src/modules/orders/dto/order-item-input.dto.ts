import { ApiProperty } from '@nestjs/swagger';

import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { ErrorCode } from '../../../common/errors/error-code.js';
import {
  DOUGHS,
  PIZZA_SIZES,
  type Dough,
  type PizzaSize,
} from '../../../pricing/pricing.constants.js';
import { ITEM_QUANTITY_MAX, ITEM_QUANTITY_MIN } from '../orders.constants.js';

const TOPPINGS_MAX = 20;

export class OrderItemInputDto {
  /**
   * Ідентифікатор товару (UUID).
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  @IsUUID(undefined, { message: ErrorCode.INVALID })
  productId: string;

  /** Розмір — обов’язковий для піци, для інших товарів його не передають. */
  @ApiProperty({ enum: PIZZA_SIZES, required: false, example: 'CM30' })
  @IsOptional()
  @IsIn(PIZZA_SIZES, { message: ErrorCode.INVALID })
  size?: PizzaSize;

  /** Тісто — обов’язкове для піци, для інших товарів його не передають. */
  @ApiProperty({ enum: DOUGHS, required: false, example: 'TRADITIONAL' })
  @IsOptional()
  @IsIn(DOUGHS, { message: ErrorCode.INVALID })
  dough?: Dough;

  /**
   * Коди добавок з `GET /meta` (лише для піци, без повторів).
   * @example ["burrata"]
   */
  @IsOptional()
  @IsString({ each: true, message: ErrorCode.INVALID })
  @ArrayMaxSize(TOPPINGS_MAX, { message: ErrorCode.INVALID })
  @IsArray({ message: ErrorCode.INVALID })
  toppingCodes?: string[];

  /**
   * Кількість, від 1 до 99.
   * @example 2
   */
  @Max(ITEM_QUANTITY_MAX, { message: ErrorCode.QUANTITY_INVALID })
  @Min(ITEM_QUANTITY_MIN, { message: ErrorCode.QUANTITY_INVALID })
  @IsInt({ message: ErrorCode.QUANTITY_INVALID })
  quantity: number;
}

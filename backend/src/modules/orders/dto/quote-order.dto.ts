import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsArray, IsIn, ValidateNested } from 'class-validator';

import { ErrorCode } from '../../../common/errors/error-code.js';
import { Fulfillment } from '../../../generated/prisma/enums.js';
import { OrderItemInputDto } from './order-item-input.dto.js';

export class QuoteOrderDto {
  /**
   * Позиції кошика (кошик живе на фронтенді). Від 1 до 30 позицій; ціни сервер рахує сам.
   * Порожній список — `409 CART_EMPTY`, понад 30 — `409 CART_LIMIT_EXCEEDED`.
   */
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  @IsArray({ message: ErrorCode.INVALID })
  items: OrderItemInputDto[];

  /** Доставка чи самовивіз. */
  @ApiProperty({ enum: Fulfillment, enumName: 'Fulfillment' })
  @IsIn(Object.values(Fulfillment), { message: ErrorCode.INVALID })
  fulfillment: Fulfillment;
}

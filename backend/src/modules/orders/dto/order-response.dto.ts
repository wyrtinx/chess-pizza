import { ApiProperty } from '@nestjs/swagger';

import { Fulfillment, OrderStatus, PaymentMethod } from '../../../generated/prisma/enums.js';
import { OrderLineDto } from './order-line.dto.js';

export class OrderResponseDto {
  /**
   * Ідентифікатор замовлення (UUID).
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  id: string;

  /**
   * Номер замовлення для людей (`#42`).
   * @example 42
   */
  number: number;

  /** Статус. Нове замовлення — завжди `ACCEPTED`. */
  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  status: OrderStatus;

  /** Доставка чи самовивіз. */
  @ApiProperty({ enum: Fulfillment, enumName: 'Fulfillment' })
  fulfillment: Fulfillment;

  /** Піцерія самовивозу; `null` — доставка. */
  pizzeriaId: string | null;

  /** Адреса доставки; `null` — самовивіз. */
  address: string | null;

  /** Коментар кур’єру. */
  courierComment: string | null;

  /**
   * Ім’я отримувача.
   * @example "Олена"
   */
  contactName: string;

  /**
   * Телефон у форматі E.164.
   * @example "+380671234567"
   */
  contactPhone: string;

  /** Спосіб оплати. Поки лише при отриманні. */
  @ApiProperty({ enum: PaymentMethod, enumName: 'PaymentMethod' })
  paymentMethod: PaymentMethod;

  /** Позиції — знімок на момент замовлення. */
  items: OrderLineDto[];

  /**
   * Сума страв у копійках.
   * @example 50700
   */
  itemsSubtotal: number;

  /**
   * Знижка за самовивіз у копійках.
   * @example 0
   */
  pickupDiscount: number;

  /**
   * Вартість доставки у копійках.
   * @example 7900
   */
  deliveryFee: number;

  /**
   * До сплати у копійках.
   * @example 58600
   */
  total: number;

  /**
   * Орієнтовний час приготування й доставки, у хвилинах.
   * @example 35
   */
  etaMinutes: number;

  /** Коли створено. */
  createdAt: Date;
}

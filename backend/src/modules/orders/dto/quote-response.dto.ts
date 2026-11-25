import { OrderLineDto } from './order-line.dto.js';

export class QuoteResponseDto {
  /** Позиції з цінами, порахованими сервером. */
  items: OrderLineDto[];

  /**
   * Сума страв у копійках.
   * @example 50700
   */
  itemsSubtotal: number;

  /**
   * Знижка за самовивіз (5 % від суми страв, до цілої гривні) у копійках; для доставки — 0.
   * @example 0
   */
  pickupDiscount: number;

  /**
   * Вартість доставки у копійках: 0 для самовивозу й від 600 ₴ суми страв.
   * @example 7900
   */
  deliveryFee: number;

  /**
   * Скільки ще додати страв до безкоштовної доставки, у копійках; 0 — вже безкоштовно.
   * @example 9300
   */
  freeDeliveryRemaining: number;

  /**
   * До сплати у копійках.
   * @example 58600
   */
  total: number;
}

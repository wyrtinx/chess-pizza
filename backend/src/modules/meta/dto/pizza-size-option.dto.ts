import { ApiProperty } from '@nestjs/swagger';

import { PIZZA_SIZES, type PizzaSize } from '../../../pricing/pricing.constants.js';

export class PizzaSizeOptionDto {
  /** Розмір піци. */
  @ApiProperty({ enum: PIZZA_SIZES, enumName: 'PizzaSize' })
  size: PizzaSize;

  /**
   * Діаметр у сантиметрах.
   * @example 25
   */
  diameterCm: number;

  /**
   * Різниця з ціною піци 30 см, у копійках. Може бути від’ємною.
   * @example -6000
   */
  priceDelta: number;
}

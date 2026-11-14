import { ApiProperty } from '@nestjs/swagger';

import { DOUGHS, type Dough } from '../../../pricing/pricing.constants.js';

export class DoughOptionDto {
  /** Тісто. */
  @ApiProperty({ enum: DOUGHS, enumName: 'Dough' })
  dough: Dough;

  /**
   * Доплата за тісто у копійках.
   * @example 0
   */
  priceDelta: number;
}

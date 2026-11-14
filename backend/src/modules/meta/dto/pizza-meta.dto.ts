import { ApiProperty } from '@nestjs/swagger';

import { PIZZA_SIZES, type PizzaSize } from '../../../pricing/pricing.constants.js';
import { ToppingResponseDto } from '../../products/dto/topping-response.dto.js';
import { DoughOptionDto } from './dough-option.dto.js';
import { PizzaSizeOptionDto } from './pizza-size-option.dto.js';

export class PizzaMetaDto {
  /** Розміри й різниця в ціні відносно піци 30 см. */
  sizes: PizzaSizeOptionDto[];

  /** Розмір, для якого вказано `basePrice` товару; його ж обрано в картці за замовчуванням. */
  // No enumName: the shared PizzaSize schema would take this property's description.
  @ApiProperty({ enum: PIZZA_SIZES, example: 'CM30' })
  defaultSize: PizzaSize;

  /** Види тіста. */
  doughs: DoughOptionDto[];

  /** Добавки, спільні для всіх піц, у порядку показу. */
  toppings: ToppingResponseDto[];
}

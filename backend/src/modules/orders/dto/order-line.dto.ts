import { ApiProperty } from '@nestjs/swagger';

import { LocalizedTextDto } from '../../../common/localized-text/localized-text.dto.js';
import { ProductCategory } from '../../../generated/prisma/enums.js';
import {
  DOUGHS,
  PIZZA_SIZES,
  type Dough,
  type PizzaSize,
} from '../../../pricing/pricing.constants.js';
import { OrderedToppingDto } from './ordered-topping.dto.js';

export class OrderLineDto {
  /**
   * Ідентифікатор товару (UUID). `null` — товар видалили назавжди.
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  productId: string | null;

  /** Назва товару на момент замовлення. */
  name: LocalizedTextDto;

  /** Категорія товару. */
  @ApiProperty({ enum: ProductCategory, enumName: 'ProductCategory' })
  category: ProductCategory;

  /** Розмір піци; `null` — не піца. */
  @ApiProperty({ enum: PIZZA_SIZES, nullable: true, example: 'CM35' })
  size: PizzaSize | null;

  /** Тісто; `null` — не піца. */
  @ApiProperty({ enum: DOUGHS, nullable: true, example: 'TRADITIONAL' })
  dough: Dough | null;

  /** Добавки з цінами на момент замовлення. */
  toppings: OrderedToppingDto[];

  /**
   * Ціна однієї штуки у копійках (розмір, тісто й добавки враховано).
   * @example 42800
   */
  unitPrice: number;

  /**
   * Кількість.
   * @example 1
   */
  quantity: number;

  /**
   * Сума позиції у копійках.
   * @example 42800
   */
  lineTotal: number;
}

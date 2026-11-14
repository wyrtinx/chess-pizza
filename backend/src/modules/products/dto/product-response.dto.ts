import { ApiProperty } from '@nestjs/swagger';

import { LocalizedTextDto } from '../../../common/localized-text/localized-text.dto.js';
import { ProductCategory } from '../../../generated/prisma/enums.js';

export class ProductResponseDto {
  /**
   * Ідентифікатор товару (UUID).
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  id: string;

  /** Назва. */
  name: LocalizedTextDto;

  /** Склад або короткий опис. */
  description: LocalizedTextDto | null;

  /** Категорія. Розмір, тісто й добавки є лише в піци. */
  @ApiProperty({ enum: ProductCategory, enumName: 'ProductCategory' })
  category: ProductCategory;

  /**
   * Ціна у копійках. Для піци — ціна розміру 30 см; надбавки за розмір і добавки — у `GET /meta`.
   * @example 24900
   */
  basePrice: number;

  /**
   * Вага у грамах (для піци — розміру 30 см). `null` — для напоїв.
   * @example 520
   */
  weightGrams: number | null;

  /** Об’єм у мілілітрах. `null` — для всього, крім напоїв. */
  volumeMl: number | null;

  /** Вегетаріанське. */
  isVegetarian: boolean;

  /**
   * Гострота від 0 до 4. Мітка «Гостре» — від 3.
   * @example 0
   */
  spicyLevel: number;

  /** Адреса фото. `null` — фото немає, фронтенд показує заглушку. */
  imageUrl: string | null;

  /**
   * Продано штук за останні 30 днів. Список вітрини вже відсортований за цим полем.
   * @example 0
   */
  popularity: number;

  /** «Новинка»: товар додано менше ніж 30 днів тому. */
  isNew: boolean;

  /** «Хіт»: товар у трійці найпопулярніших. */
  isHit: boolean;

  /** Коли товар додано — для сортування «новинки». */
  createdAt: Date;
}

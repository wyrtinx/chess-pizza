import { LocalizedTextDto } from '../../../common/localized-text/localized-text.dto.js';

export class OrderedToppingDto {
  /**
   * Код добавки.
   * @example "burrata"
   */
  code: string;

  /** Назва. */
  name: LocalizedTextDto;

  /**
   * Ціна добавки у копійках.
   * @example 7900
   */
  price: number;
}

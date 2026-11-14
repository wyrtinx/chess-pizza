import { LocalizedTextDto } from '../../../common/localized-text/localized-text.dto.js';

export class ToppingResponseDto {
  /**
   * Стабільний код добавки — саме його передають у кошик.
   * @example "burrata"
   */
  code: string;

  /** Назва. */
  name: LocalizedTextDto;

  /**
   * Ціна у копійках.
   * @example 7900
   */
  price: number;
}

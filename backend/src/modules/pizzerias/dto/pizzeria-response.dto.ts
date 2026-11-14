import { LocalizedTextDto } from '../../../common/localized-text/localized-text.dto.js';

export class PizzeriaResponseDto {
  /**
   * Ідентифікатор піцерії (UUID) — його передають при оформленні самовивозу.
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  id: string;

  /** Адреса. */
  address: LocalizedTextDto;
}

export class DeliveryMetaDto {
  /**
   * Вартість доставки у копійках.
   * @example 7900
   */
  fee: number;

  /**
   * Сума страв у копійках, від якої доставка безкоштовна. Знижки й бонуси на поріг не впливають.
   * @example 60000
   */
  freeFrom: number;

  /**
   * Середній час доставки у хвилинах — час для «Якнайшвидше».
   * @example 35
   */
  etaMinutes: number;
}

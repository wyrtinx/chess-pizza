export class BonusesMetaDto {
  /**
   * Кешбек балами у відсотках від частини страв, оплаченої грошима.
   * @example 5
   */
  cashbackPercent: number;

  /**
   * Знижка на перше замовлення у відсотках від суми страв.
   * @example 10
   */
  firstOrderDiscountPercent: number;

  /**
   * Скільки копійок в одному балі (1 бал = 1 ₴).
   * @example 100
   */
  kopecksPerPoint: number;
}

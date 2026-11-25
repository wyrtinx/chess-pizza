export class ProductImageDto {
  /**
   * Для картки в меню: 4:3, 540×405.
   * @example "http://localhost:3000/files/products/margherita/card.webp"
   */
  card: string;

  /**
   * Для картки товару (модалки): 4:5, 760×950.
   * @example "http://localhost:3000/files/products/margherita/detail.webp"
   */
  detail: string;

  /**
   * Мініатюра для кошика: 1:1, 124×124.
   * @example "http://localhost:3000/files/products/margherita/thumb.webp"
   */
  thumb: string;
}

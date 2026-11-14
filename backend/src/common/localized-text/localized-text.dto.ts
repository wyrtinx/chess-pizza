export class LocalizedTextDto {
  /**
   * Текст українською.
   * @example "Маргарита"
   */
  uk: string;

  /**
   * Текст англійською. Якщо його немає, фронтенд показує український.
   * @example "Margherita"
   */
  en?: string;
}

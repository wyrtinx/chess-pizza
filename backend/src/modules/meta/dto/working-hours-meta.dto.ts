export class WorkingHoursMetaDto {
  /**
   * Початок доставки й видачі, `HH:mm` за часом `timeZone`.
   * @example "12:00"
   */
  opensAt: string;

  /**
   * Кінець доставки й видачі, `HH:mm` за часом `timeZone`.
   * @example "23:30"
   */
  closesAt: string;

  /**
   * Часовий пояс піцерії (IANA).
   * @example "Europe/Kyiv"
   */
  timeZone: string;

  /**
   * За скільки хвилин щонайменше можна обрати слот «До HH:00».
   * @example 60
   */
  slotLeadMinutes: number;
}

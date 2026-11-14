export class ResendCodeResponseDto {
  /**
   * Через скільки секунд можна надіслати код знову. `0` — лист не вдалося відправити, можна одразу.
   * @example 60
   */
  retryAfter: number;
}

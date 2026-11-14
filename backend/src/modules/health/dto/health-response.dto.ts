export class HealthResponseDto {
  /**
   * Стан сервісу. Завжди `ok`: якщо база даних недоступна, відповідь — `503`.
   * @example "ok"
   */
  status: 'ok';
}

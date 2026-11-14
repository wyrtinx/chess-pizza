import { AuthUserResponseDto } from './auth-user-response.dto.js';

export class RegisterResponseDto extends AuthUserResponseDto {
  /**
   * Через скільки секунд можна надіслати код знову. `0` — лист не вдалося відправити, можна одразу.
   * @example 60
   */
  retryAfter: number;
}

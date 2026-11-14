import { UserDto } from './user.dto.js';

export class UserProfileDto extends UserDto {
  /**
   * Телефон у форматі E.164. `null` — ще не було замовлення.
   * @example "+380671234567"
   */
  phone: string | null;

  /** Адреса доставки. `null` — ще не було замовлення з доставкою. */
  address: string | null;

  /**
   * Баланс бонусів у балах (1 бал = 1 ₴).
   * @example 0
   */
  bonusBalance: number;

  /** Коли зареєструвався. */
  createdAt: Date;
}

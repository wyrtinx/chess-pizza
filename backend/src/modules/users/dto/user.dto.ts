import { ApiProperty } from '@nestjs/swagger';

import { Locale, Role } from '../../../generated/prisma/enums.js';

export class UserDto {
  /**
   * Ідентифікатор користувача (UUID).
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  id: string;

  /**
   * E-mail у нижньому регістрі.
   * @example "olena@example.com"
   */
  email: string;

  /**
   * Ім’я.
   * @example "Олена"
   */
  name: string;

  /** Роль: `ADMIN` бачить адмін-панель. */
  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  /** Пошту підтверджено кодом. Без підтвердження немає бонусів і знижки першого замовлення. */
  emailVerified: boolean;

  /** Мова листів. */
  @ApiProperty({ enum: Locale, enumName: 'Locale' })
  locale: Locale;
}

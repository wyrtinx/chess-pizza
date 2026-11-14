import { UserDto } from '../../users/dto/user.dto.js';

export class SessionResponseDto {
  /** Користувач сесії; `null` — гість. */
  user: UserDto | null;
}

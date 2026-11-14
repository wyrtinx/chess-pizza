import { UserDto } from '../../users/dto/user.dto.js';

export class AuthUserResponseDto {
  /** Користувач поточної сесії. */
  user: UserDto;
}

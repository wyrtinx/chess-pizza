import type { User } from '../../generated/prisma/client.js';
import type { UserProfileDto } from './dto/user-profile.dto.js';
import type { UserDto } from './dto/user.dto.js';

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerifiedAt !== null,
    locale: user.locale,
  };
}

export function toUserProfileDto(user: User): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerifiedAt !== null,
    locale: user.locale,
    phone: user.phone,
    address: user.address,
    bonusBalance: user.bonusBalance,
    createdAt: user.createdAt,
  };
}

import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { Prisma, type User } from '../../generated/prisma/client.js';
import type { Locale } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { UserProfileDto } from './dto/user-profile.dto.js';
import { toUserProfileDto } from './user.mapper.js';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  locale: Locale;
  termsAcceptedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data: input });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppException(ErrorCode.EMAIL_TAKEN, HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  markEmailVerified(id: string, tx: Prisma.TransactionClient = this.prisma): Promise<User> {
    return tx.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });
  }

  async getProfile(id: string): Promise<UserProfileDto> {
    const user = await this.findById(id);
    // A valid access token can outlive its user for up to 15 minutes.
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    return toUserProfileDto(user);
  }
}

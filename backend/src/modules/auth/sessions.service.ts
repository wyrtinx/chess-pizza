import { randomUUID } from 'node:crypto';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { REFRESH_TOKEN_TTL_MS } from './auth.constants.js';
import { generateOpaqueToken, sha256 } from './tokens.js';

export interface ClientInfo {
  ip: string | undefined;
  userAgent: string | undefined;
}

export interface RotatedSession {
  userId: string;
  refreshToken: string;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Starts a new session family and returns its refresh token. */
  start(userId: string, client: ClientInfo): Promise<string> {
    return this.issue(this.prisma, userId, randomUUID(), client);
  }

  /**
   * Swaps a refresh token for a new one of the same family.
   * A token that was already swapped means it leaked: the whole family is revoked.
   */
  async rotate(refreshToken: string, client: ClientInfo): Promise<RotatedSession> {
    const now = new Date();
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash: sha256(refreshToken) },
    });

    if (!session || session.revokedAt !== null) throw invalidSession();
    if (session.rotatedAt !== null) return this.reject(session.familyId, session.userId);
    if (session.expiresAt <= now) throw invalidSession();

    const newToken = await this.prisma.$transaction(async (tx) => {
      // Conditional update: of two concurrent rotations only one can claim the token.
      const { count } = await tx.authSession.updateMany({
        where: { id: session.id, rotatedAt: null, revokedAt: null },
        data: { rotatedAt: now },
      });
      if (count === 0) return null;
      return this.issue(tx, session.userId, session.familyId, client);
    });

    if (newToken === null) return this.reject(session.familyId, session.userId);
    return { userId: session.userId, refreshToken: newToken };
  }

  /** Revokes the family of the given token; unknown tokens are ignored. */
  async revoke(refreshToken: string): Promise<void> {
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash: sha256(refreshToken) },
      select: { familyId: true },
    });
    if (session) await this.revokeFamily(session.familyId);
  }

  private async reject(familyId: string, userId: string): Promise<never> {
    await this.revokeFamily(familyId);
    this.logger.warn({ userId, familyId }, 'Refresh token reused, session family revoked');
    throw new AppException(ErrorCode.SESSION_REUSED, HttpStatus.UNAUTHORIZED);
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issue(
    db: Prisma.TransactionClient,
    userId: string,
    familyId: string,
    { ip, userAgent }: ClientInfo,
  ): Promise<string> {
    const token = generateOpaqueToken();
    await db.authSession.create({
      data: {
        userId,
        familyId,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        ip: ip ?? null,
        userAgent: userAgent ?? null,
      },
    });
    return token;
  }
}

function invalidSession(): AppException {
  return new AppException(ErrorCode.SESSION_INVALID, HttpStatus.UNAUTHORIZED);
}

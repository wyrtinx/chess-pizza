import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { HealthResponseDto } from './dto/health-response.dto.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponseDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error(error, 'Database health check failed');
      throw new AppException(ErrorCode.INTERNAL_ERROR, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return { status: 'ok' };
  }
}

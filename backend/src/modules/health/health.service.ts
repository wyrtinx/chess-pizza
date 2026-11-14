import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

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
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException();
    }

    return { status: 'ok' };
  }
}

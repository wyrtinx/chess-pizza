import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { ApiErrors } from '../../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Стан сервісу
   *
   * @remarks
   * Перевіряє, що застосунок працює й база даних відповідає.
   * Використовується хостингом і Docker healthcheck.
   */
  @Get()
  @SkipThrottle()
  @ApiErrors(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR)
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}

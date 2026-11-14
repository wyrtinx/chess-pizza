import { Controller, Get } from '@nestjs/common';
import { ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';

import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Стан сервісу
   *
   * Перевіряє, що застосунок працює й база даних відповідає.
   * Використовується хостингом і Docker healthcheck.
   */
  @Get()
  @ApiServiceUnavailableResponse({ description: 'База даних недоступна' })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}

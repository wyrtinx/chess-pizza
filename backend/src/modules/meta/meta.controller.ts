import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MetaResponseDto } from './dto/meta-response.dto.js';
import { MetaService } from './meta.service.js';

@ApiTags('meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  /**
   * Публічні константи
   *
   * @remarks
   * Числа, за якими сервер рахує ціни й знижки: опції піци, добавки, доставка, самовивіз,
   * бонуси, години роботи. Фронтенд бере їх звідси й не дублює в коді.
   * Остаточну ціну завжди рахує сервер.
   */
  @Get()
  getMeta(): Promise<MetaResponseDto> {
    return this.metaService.getMeta();
  }
}

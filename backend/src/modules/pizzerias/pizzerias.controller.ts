import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PizzeriaResponseDto } from './dto/pizzeria-response.dto.js';
import { PizzeriasService } from './pizzerias.service.js';

@ApiTags('pizzerias')
@Controller('pizzerias')
export class PizzeriasController {
  constructor(private readonly pizzeriasService: PizzeriasService) {}

  /**
   * Піцерії для самовивозу
   *
   * @remarks
   * Точки, де можна забрати замовлення. На ціну вибір піцерії не впливає.
   */
  @Get()
  findActive(): Promise<PizzeriaResponseDto[]> {
    return this.pizzeriasService.findActive();
  }
}

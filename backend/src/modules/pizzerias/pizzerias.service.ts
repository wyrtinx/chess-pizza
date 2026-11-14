import { Injectable } from '@nestjs/common';

import { toLocalizedText } from '../../common/localized-text/to-localized-text.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PizzeriaResponseDto } from './dto/pizzeria-response.dto.js';

@Injectable()
export class PizzeriasService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<PizzeriaResponseDto[]> {
    const pizzerias = await this.prisma.pizzeria.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return pizzerias.map(({ id, address }) => ({ id, address: toLocalizedText(address) }));
  }
}

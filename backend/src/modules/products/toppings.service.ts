import { Injectable } from '@nestjs/common';

import { toLocalizedText } from '../../common/localized-text/to-localized-text.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ToppingResponseDto } from './dto/topping-response.dto.js';

@Injectable()
export class ToppingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<ToppingResponseDto[]> {
    const toppings = await this.prisma.topping.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return toppings.map(({ code, name, price }) => ({
      code,
      name: toLocalizedText(name),
      price,
    }));
  }
}

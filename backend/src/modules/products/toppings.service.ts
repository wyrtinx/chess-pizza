import { Injectable } from '@nestjs/common';

import { toLocalizedText } from '../../common/localized-text/to-localized-text.js';
import type { Topping } from '../../generated/prisma/client.js';
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

    return toppings.map(toToppingResponse);
  }

  async findActiveByCodes(codes: readonly string[]): Promise<ToppingResponseDto[]> {
    const toppings = await this.prisma.topping.findMany({
      where: { isActive: true, code: { in: [...codes] } },
    });

    return toppings.map(toToppingResponse);
  }
}

function toToppingResponse({ code, name, price }: Topping): ToppingResponseDto {
  return { code, name: toLocalizedText(name), price };
}

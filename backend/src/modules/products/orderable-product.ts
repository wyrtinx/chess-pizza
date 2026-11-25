import type { LocalizedTextDto } from '../../common/localized-text/localized-text.dto.js';
import type { ProductCategory } from '../../generated/prisma/enums.js';

export interface OrderableProduct {
  id: string;
  name: LocalizedTextDto;
  category: ProductCategory;
  basePrice: number;
  available: boolean;
}

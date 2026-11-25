import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { toLocalizedText } from '../../common/localized-text/to-localized-text.js';
import type { Env } from '../../config/env.js';
import type { Product } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ProductImageDto } from './dto/product-image.dto.js';
import type { ProductResponseDto } from './dto/product-response.dto.js';
import type { OrderableProduct } from './orderable-product.js';
import { labelProducts, type LabeledProduct } from './product-labels.js';

@Injectable()
export class ProductsService {
  private readonly filesUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.filesUrl = config.get('PUBLIC_FILES_URL', { infer: true });
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isVisible: true, deletedAt: null },
    });

    // There are no orders yet, so nothing is sold: the ranking falls back to sortOrder.
    return labelProducts(products, new Map(), new Date()).map((labeled) =>
      toProductResponse(labeled, this.filesUrl),
    );
  }

  /** Products by id for pricing an order; hidden and deleted ones come back unavailable. */
  async findForOrder(ids: readonly string[]): Promise<OrderableProduct[]> {
    const products = await this.prisma.product.findMany({ where: { id: { in: [...ids] } } });

    return products.map((product) => ({
      id: product.id,
      name: toLocalizedText(product.name),
      category: product.category,
      basePrice: product.basePrice,
      available: product.isVisible && product.deletedAt === null,
    }));
  }

  // Goes through the whole showcase because `isHit` depends on the ranking; the menu is small.
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = (await this.findAll()).find((item) => item.id === id);
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);

    return product;
  }
}

function toProductResponse(
  { product, popularity, isNew, isHit }: LabeledProduct<Product>,
  filesUrl: string,
): ProductResponseDto {
  return {
    id: product.id,
    name: toLocalizedText(product.name),
    description: product.description === null ? null : toLocalizedText(product.description),
    category: product.category,
    basePrice: product.basePrice,
    weightGrams: product.weightGrams,
    volumeMl: product.volumeMl,
    isVegetarian: product.isVegetarian,
    spicyLevel: product.spicyLevel,
    image: product.imageKey === null ? null : toProductImage(`${filesUrl}/${product.imageKey}`),
    popularity,
    isNew,
    isHit,
    createdAt: product.createdAt,
  };
}

function toProductImage(base: string): ProductImageDto {
  return { card: `${base}/card.webp`, detail: `${base}/detail.webp`, thumb: `${base}/thumb.webp` };
}

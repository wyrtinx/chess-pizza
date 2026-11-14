import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { toLocalizedText } from '../../common/localized-text/to-localized-text.js';
import type { Product } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ProductResponseDto } from './dto/product-response.dto.js';
import { labelProducts, type LabeledProduct } from './product-labels.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isVisible: true, deletedAt: null },
    });

    // There are no orders yet, so nothing is sold: the ranking falls back to sortOrder.
    return labelProducts(products, new Map(), new Date()).map(toProductResponse);
  }

  // Goes through the whole showcase because `isHit` depends on the ranking; the menu is small.
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = (await this.findAll()).find((item) => item.id === id);
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);

    return product;
  }
}

function toProductResponse({
  product,
  popularity,
  isNew,
  isHit,
}: LabeledProduct<Product>): ProductResponseDto {
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
    // File storage is not wired yet, so no product has a photo.
    imageUrl: null,
    popularity,
    isNew,
    isHit,
    createdAt: product.createdAt,
  };
}

import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import type { LocalizedTextDto } from '../../common/localized-text/localized-text.dto.js';
import { toLocalizedText } from '../../common/localized-text/to-localized-text.js';
import { Prisma } from '../../generated/prisma/client.js';
import { Fulfillment, PaymentMethod, type Locale } from '../../generated/prisma/enums.js';
import { orderTotals, type OrderTotals } from '../../pricing/order-totals.js';
import { ETA_MINUTES } from '../../pricing/pricing.constants.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../auth/request-user.js';
import { sha256 } from '../auth/tokens.js';
import { PizzeriasService } from '../pizzerias/pizzerias.service.js';
import { ProductsService } from '../products/products.service.js';
import { ToppingsService } from '../products/toppings.service.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { OrderLineDto } from './dto/order-line.dto.js';
import type { OrderResponseDto } from './dto/order-response.dto.js';
import type { QuoteOrderDto } from './dto/quote-order.dto.js';
import type { QuoteResponseDto } from './dto/quote-response.dto.js';
import { resolveLines, type ResolvedLine } from './order-lines.js';
import {
  GUEST_IDEMPOTENCY_SCOPE,
  IDEMPOTENCY_KEY_TTL_MS,
  ORDER_ITEMS_MAX,
} from './orders.constants.js';

interface PricedOrder extends OrderTotals {
  lines: ResolvedLine[];
}

interface PlaceOrderContext {
  idempotencyKey: string;
  user: AuthenticatedUser | undefined;
  locale: Locale;
}

const ORDER_INCLUDE = { items: { orderBy: { position: 'asc' } } } as const;
type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly toppings: ToppingsService,
    private readonly pizzerias: PizzeriasService,
  ) {}

  async quote(dto: QuoteOrderDto): Promise<QuoteResponseDto> {
    const { lines, ...totals } = await this.price(dto);
    return { items: lines, ...totals };
  }

  async create(dto: CreateOrderDto, context: PlaceOrderContext): Promise<OrderResponseDto> {
    const scope = context.user ? `user:${context.user.id}` : GUEST_IDEMPOTENCY_SCOPE;
    const requestHash = sha256(requestFingerprint(dto));

    const replayed = await this.findReplay(scope, context.idempotencyKey, requestHash);
    if (replayed) return replayed;

    const priced = await this.price(dto);
    const isPickup = dto.fulfillment === Fulfillment.PICKUP;
    if (isPickup && !(await this.pizzerias.isActive(dto.pizzeriaId ?? ''))) {
      throw new AppException(ErrorCode.PIZZERIA_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: context.user?.id ?? null,
            placedAsGuest: context.user === undefined,
            fulfillment: dto.fulfillment,
            pizzeriaId: isPickup ? (dto.pizzeriaId ?? null) : null,
            address: isPickup ? null : (dto.address ?? null),
            courierComment: isPickup ? null : emptyToNull(dto.courierComment),
            contactName: dto.name,
            contactPhone: dto.phone,
            paymentMethod: PaymentMethod.ON_RECEIPT,
            locale: context.locale,
            itemsSubtotal: priced.itemsSubtotal,
            pickupDiscount: priced.pickupDiscount,
            deliveryFee: priced.deliveryFee,
            total: priced.total,
            items: {
              create: priced.lines.map((line, position) => toOrderItemData(line, position)),
            },
          },
          include: ORDER_INCLUDE,
        });
        await tx.idempotencyKey.create({
          data: {
            key: context.idempotencyKey,
            scope,
            requestHash,
            orderId: created.id,
            expiresAt: new Date(Date.now() + IDEMPOTENCY_KEY_TTL_MS),
          },
        });
        return created;
      });
      return toOrderResponse(order);
    } catch (error) {
      // A concurrent request with the same key won the race: answer with its order.
      if (isUniqueViolation(error)) {
        const winner = await this.findReplay(scope, context.idempotencyKey, requestHash);
        if (winner) return winner;
      }
      throw error;
    }
  }

  private async findReplay(
    scope: string,
    key: string,
    requestHash: string,
  ): Promise<OrderResponseDto | null> {
    const stored = await this.prisma.idempotencyKey.findUnique({
      where: { scope_key: { scope, key } },
      include: { order: { include: ORDER_INCLUDE } },
    });
    if (!stored) return null;
    if (stored.requestHash !== requestHash) {
      throw new AppException(ErrorCode.IDEMPOTENCY_KEY_MISMATCH, HttpStatus.CONFLICT);
    }
    return toOrderResponse(stored.order);
  }

  private async price(dto: QuoteOrderDto): Promise<PricedOrder> {
    if (dto.items.length === 0) throw new AppException(ErrorCode.CART_EMPTY, HttpStatus.CONFLICT);
    if (dto.items.length > ORDER_ITEMS_MAX) {
      throw new AppException(ErrorCode.CART_LIMIT_EXCEEDED, HttpStatus.CONFLICT);
    }

    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const toppingCodes = [...new Set(dto.items.flatMap((item) => item.toppingCodes ?? []))];
    const [products, toppings] = await Promise.all([
      this.products.findForOrder(productIds),
      toppingCodes.length > 0 ? this.toppings.findActiveByCodes(toppingCodes) : [],
    ]);

    const { lines, unavailable, invalidOptions } = resolveLines(
      dto.items,
      new Map(products.map((product) => [product.id, product])),
      new Map(toppings.map((topping) => [topping.code, topping])),
    );
    if (unavailable.length > 0) {
      throw new AppException(
        ErrorCode.CART_HAS_UNAVAILABLE_ITEMS,
        HttpStatus.CONFLICT,
        unavailable,
      );
    }
    if (invalidOptions.length > 0) {
      throw new AppException(
        ErrorCode.PRODUCT_OPTIONS_INVALID,
        HttpStatus.BAD_REQUEST,
        invalidOptions,
      );
    }

    return {
      lines,
      ...orderTotals(
        lines.map((line) => line.lineTotal),
        dto.fulfillment,
      ),
    };
  }
}

/** Same order in any key order or topping order hashes the same. */
function requestFingerprint(dto: CreateOrderDto): string {
  const isPickup = dto.fulfillment === Fulfillment.PICKUP;
  return JSON.stringify({
    items: dto.items.map((item) => ({
      productId: item.productId,
      size: item.size ?? null,
      dough: item.dough ?? null,
      toppingCodes: (item.toppingCodes ?? []).toSorted(),
      quantity: item.quantity,
    })),
    fulfillment: dto.fulfillment,
    name: dto.name,
    phone: dto.phone,
    address: isPickup ? null : (dto.address ?? null),
    courierComment: isPickup ? null : emptyToNull(dto.courierComment),
    pizzeriaId: isPickup ? (dto.pizzeriaId ?? null) : null,
  });
}

function emptyToNull(value: string | undefined): string | null {
  return value === undefined || value === '' ? null : value;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function toOrderItemData(
  line: ResolvedLine,
  position: number,
): Prisma.OrderItemCreateWithoutOrderInput {
  return {
    product: { connect: { id: line.productId } },
    position,
    name: toJsonText(line.name),
    category: line.category,
    size: line.size,
    dough: line.dough,
    toppings: line.toppings.map(({ code, name, price }) => ({
      code,
      name: toJsonText(name),
      price,
    })),
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    lineTotal: line.lineTotal,
  };
}

function toJsonText({ uk, en }: LocalizedTextDto): Prisma.InputJsonObject {
  return en === undefined ? { uk } : { uk, en };
}

function toOrderResponse(order: OrderWithItems): OrderResponseDto {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    fulfillment: order.fulfillment,
    pizzeriaId: order.pizzeriaId,
    address: order.address,
    courierComment: order.courierComment,
    contactName: order.contactName,
    contactPhone: order.contactPhone,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: toLocalizedText(item.name),
      category: item.category,
      size: item.size,
      dough: item.dough,
      toppings: toOrderedToppings(item.toppings),
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    itemsSubtotal: order.itemsSubtotal,
    pickupDiscount: order.pickupDiscount,
    deliveryFee: order.deliveryFee,
    total: order.total,
    etaMinutes: ETA_MINUTES,
    createdAt: order.createdAt,
  };
}

function toOrderedToppings(value: Prisma.JsonValue): OrderLineDto['toppings'] {
  if (!Array.isArray(value)) throw new TypeError('Order item toppings must be an array');

  return value.map((topping) => {
    if (typeof topping !== 'object' || topping === null || Array.isArray(topping)) {
      throw new TypeError('Order item topping must be an object');
    }
    const { code, name, price } = topping;
    if (typeof code !== 'string' || typeof price !== 'number' || name === undefined) {
      throw new TypeError('Order item topping is malformed');
    }
    return { code, name: toLocalizedText(name), price };
  });
}

import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

import type { Request } from 'express';

import { ApiErrors } from '../../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/request-user.js';
import { resolveLocale } from '../auth/resolve-locale.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { QuoteOrderDto } from './dto/quote-order.dto.js';
import { QuoteResponseDto } from './dto/quote-response.dto.js';
import { IdempotencyKey } from './idempotency-key.decorator.js';
import { IDEMPOTENCY_KEY_HEADER } from './orders.constants.js';
import { OrdersService } from './orders.service.js';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Підсумок замовлення
   *
   * @remarks
   * Рахує суму для екрана оформлення з позицій кошика: ціни позицій, знижку за самовивіз,
   * доставку й суму до сплати. Ціни, що прийшли від клієнта, не потрібні — сервер рахує сам.
   * Нічого не зберігає.
   */
  @Post('quote')
  @HttpCode(HttpStatus.OK)
  @ApiErrors(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, ErrorCode.PRODUCT_OPTIONS_INVALID)
  @ApiErrors(
    HttpStatus.CONFLICT,
    ErrorCode.CART_EMPTY,
    ErrorCode.CART_LIMIT_EXCEEDED,
    ErrorCode.CART_HAS_UNAVAILABLE_ITEMS,
  )
  quote(@Body() dto: QuoteOrderDto): Promise<QuoteResponseDto> {
    return this.ordersService.quote(dto);
  }

  /**
   * Оформлення замовлення
   *
   * @remarks
   * Створює замовлення гостя або користувача, що увійшов. Ціни рахує сервер; позиції зберігаються знімком.
   * Оплата — при отриманні, час — «якнайшвидше».
   *
   * Заголовок `Idempotency-Key` обов’язковий (8–100 символів `A–Z a–z 0–9 _ -`, зручно — UUID, новий для кожного оформлення).
   * Повтор із тим самим ключем і тим самим тілом повертає вже створене замовлення, а не створює друге;
   * той самий ключ з іншим тілом — `409 IDEMPOTENCY_KEY_MISMATCH`.
   *
   * Недоступні товари — `409 CART_HAS_UNAVAILABLE_ITEMS`, у `details` — їхні позиції (`items.N`).
   */
  @Post()
  @Auth({ optional: true })
  @ApiHeader({ name: IDEMPOTENCY_KEY_HEADER, required: true, description: 'Ключ ідемпотентності.' })
  @ApiErrors(
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.PRODUCT_OPTIONS_INVALID,
    ErrorCode.IDEMPOTENCY_KEY_REQUIRED,
  )
  @ApiErrors(HttpStatus.NOT_FOUND, ErrorCode.PIZZERIA_NOT_FOUND)
  @ApiErrors(
    HttpStatus.CONFLICT,
    ErrorCode.CART_EMPTY,
    ErrorCode.CART_LIMIT_EXCEEDED,
    ErrorCode.CART_HAS_UNAVAILABLE_ITEMS,
    ErrorCode.IDEMPOTENCY_KEY_MISMATCH,
  )
  create(
    @Body() dto: CreateOrderDto,
    @IdempotencyKey() idempotencyKey: string,
    @CurrentUser({ optional: true }) user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(dto, {
      idempotencyKey,
      user,
      locale: resolveLocale(req.get('accept-language')),
    });
  }
}

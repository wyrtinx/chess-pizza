import { ApiProperty } from '@nestjs/swagger';

import { ErrorCode } from './error-code.js';
import { ErrorDetailDto } from './error-detail.dto.js';

export class ErrorResponseDto {
  /**
   * HTTP-статус відповіді.
   * @example 400
   */
  statusCode: number;

  /** Машинний код помилки. Текст для людини підставляє фронтенд. */
  @ApiProperty({ enum: ErrorCode, enumName: 'ErrorCode', example: ErrorCode.VALIDATION_FAILED })
  code: ErrorCode;

  /**
   * Короткий опис англійською — для розробника, не для показу користувачу.
   * @example "Validation failed"
   */
  message: string;

  /** Помилки окремих полів. Є лише там, де помилка стосується конкретних полів запиту. */
  details?: ErrorDetailDto[];

  /**
   * Ідентифікатор запиту — той самий, що в заголовку `X-Request-Id`.
   * @example "0199a3f2-7c1e-7b7a-9f0e-2d6c5a4b3c21"
   */
  requestId: string;
}

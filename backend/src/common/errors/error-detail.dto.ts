import { ApiProperty } from '@nestjs/swagger';

import { ErrorCode } from './error-code.js';

export class ErrorDetailDto {
  /**
   * Поле запиту, якого стосується помилка. Вкладені поля — через крапку.
   * @example "items.0.quantity"
   */
  field: string;

  /** Машинний код помилки поля. Текст для людини підставляє фронтенд. */
  @ApiProperty({ enum: ErrorCode, enumName: 'ErrorCode', example: ErrorCode.QUANTITY_INVALID })
  code: ErrorCode;
}

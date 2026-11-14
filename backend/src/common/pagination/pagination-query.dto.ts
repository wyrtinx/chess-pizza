import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { ErrorCode } from '../errors/error-code.js';
import { IsCursor } from './is-cursor.decorator.js';

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;

export class PaginationQueryDto {
  /** Скільки елементів повернути. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorCode.INVALID })
  @Min(1, { message: ErrorCode.INVALID })
  @Max(MAX_PAGE_LIMIT, { message: ErrorCode.INVALID })
  limit: number = DEFAULT_PAGE_LIMIT;

  /** Курсор — значення `nextCursor` з попередньої сторінки. Без нього — перша сторінка. */
  @IsOptional()
  @IsCursor()
  cursor?: string;
}

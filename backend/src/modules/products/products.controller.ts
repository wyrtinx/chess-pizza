import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiErrors } from '../../common/errors/api-errors.decorator.js';
import { ErrorCode } from '../../common/errors/error-code.js';
import { IdParamDto } from '../../common/validation/id-param.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Вітрина
   *
   * @remarks
   * Усі видимі товари одним списком, без пагінації: спершу найпопулярніші.
   * Пошук, категорії, «Вегетаріанське» й сортування робить фронтенд.
   * Приховані й видалені товари не віддаються.
   */
  @Get()
  findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  /**
   * Товар за ідентифікатором
   *
   * @remarks
   * Прихований або видалений товар — `404`, як і неіснуючий.
   */
  @Get(':id')
  @ApiErrors(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED)
  @ApiErrors(HttpStatus.NOT_FOUND, ErrorCode.PRODUCT_NOT_FOUND)
  findOne(@Param() { id }: IdParamDto): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }
}

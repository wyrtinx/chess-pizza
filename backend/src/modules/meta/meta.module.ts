import { Module } from '@nestjs/common';

import { ProductsModule } from '../products/products.module.js';
import { MetaController } from './meta.controller.js';
import { MetaService } from './meta.service.js';

@Module({
  imports: [ProductsModule],
  controllers: [MetaController],
  providers: [MetaService],
})
export class MetaModule {}

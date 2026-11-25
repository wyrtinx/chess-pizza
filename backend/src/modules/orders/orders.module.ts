import { Module } from '@nestjs/common';

import { PizzeriasModule } from '../pizzerias/pizzerias.module.js';
import { ProductsModule } from '../products/products.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [ProductsModule, PizzeriasModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

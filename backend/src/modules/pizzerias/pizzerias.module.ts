import { Module } from '@nestjs/common';

import { PizzeriasController } from './pizzerias.controller.js';
import { PizzeriasService } from './pizzerias.service.js';

@Module({
  controllers: [PizzeriasController],
  providers: [PizzeriasService],
})
export class PizzeriasModule {}

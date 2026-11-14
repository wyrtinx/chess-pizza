import { Injectable } from '@nestjs/common';

import {
  BUSINESS_TIME_ZONE,
  CASHBACK_PERCENT,
  CLOSING_TIME,
  DEFAULT_PIZZA_SIZE,
  DELIVERY_FEE,
  DOUGH_DELTA,
  DOUGHS,
  ETA_MINUTES,
  FIRST_ORDER_DISCOUNT_PERCENT,
  FREE_DELIVERY_THRESHOLD,
  KOPECKS_PER_POINT,
  OPENING_TIME,
  PICKUP_DISCOUNT_PERCENT,
  PIZZA_SIZES,
  SIZE_DELTA,
  SIZE_DIAMETER_CM,
  SLOT_LEAD_MINUTES,
} from '../../pricing/pricing.constants.js';
import { ToppingsService } from '../products/toppings.service.js';
import type { MetaResponseDto } from './dto/meta-response.dto.js';

@Injectable()
export class MetaService {
  constructor(private readonly toppingsService: ToppingsService) {}

  async getMeta(): Promise<MetaResponseDto> {
    return {
      pizza: {
        sizes: PIZZA_SIZES.map((size) => ({
          size,
          diameterCm: SIZE_DIAMETER_CM[size],
          priceDelta: SIZE_DELTA[size],
        })),
        defaultSize: DEFAULT_PIZZA_SIZE,
        doughs: DOUGHS.map((dough) => ({ dough, priceDelta: DOUGH_DELTA[dough] })),
        toppings: await this.toppingsService.findActive(),
      },
      delivery: {
        fee: DELIVERY_FEE,
        freeFrom: FREE_DELIVERY_THRESHOLD,
        etaMinutes: ETA_MINUTES,
      },
      pickup: { discountPercent: PICKUP_DISCOUNT_PERCENT },
      bonuses: {
        cashbackPercent: CASHBACK_PERCENT,
        firstOrderDiscountPercent: FIRST_ORDER_DISCOUNT_PERCENT,
        kopecksPerPoint: KOPECKS_PER_POINT,
      },
      workingHours: {
        opensAt: OPENING_TIME,
        closesAt: CLOSING_TIME,
        timeZone: BUSINESS_TIME_ZONE,
        slotLeadMinutes: SLOT_LEAD_MINUTES,
      },
    };
  }
}

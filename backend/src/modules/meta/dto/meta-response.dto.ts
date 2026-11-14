import { BonusesMetaDto } from './bonuses-meta.dto.js';
import { DeliveryMetaDto } from './delivery-meta.dto.js';
import { PickupMetaDto } from './pickup-meta.dto.js';
import { PizzaMetaDto } from './pizza-meta.dto.js';
import { WorkingHoursMetaDto } from './working-hours-meta.dto.js';

export class MetaResponseDto {
  /** Опції піци: розміри, тісто, добавки. */
  pizza: PizzaMetaDto;

  /** Доставка. */
  delivery: DeliveryMetaDto;

  /** Самовивіз. */
  pickup: PickupMetaDto;

  /** Бонуси й знижка першого замовлення. */
  bonuses: BonusesMetaDto;

  /** Години роботи. */
  workingHours: WorkingHoursMetaDto;
}

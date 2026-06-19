import { Injectable } from '@nestjs/common';
import type { RoutineDeliveryPort } from './routine-delivery.port';

@Injectable()
export class WebOnlyDelivery implements RoutineDeliveryPort {
  readonly channel = 'WEB' as const;

  async deliver(): Promise<boolean> {
    return true;
  }
}

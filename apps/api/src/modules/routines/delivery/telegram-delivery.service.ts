import { Injectable } from '@nestjs/common';
import { TelegramService } from '../../telegram/telegram.service';
import type { RoutineDeliveryPort } from './routine-delivery.port';

@Injectable()
export class TelegramDelivery implements RoutineDeliveryPort {
  readonly channel = 'TELEGRAM' as const;

  constructor(private readonly telegram: TelegramService) {}

  async deliver(userId: string, content: string): Promise<boolean> {
    return this.telegram.sendToUser(userId, content);
  }
}

import { DynamicModule, Module } from '@nestjs/common';
import { TelegramModule } from '../../telegram/telegram.module';
import { ROUTINE_DELIVERY } from './routine-delivery.port';
import { WebOnlyDelivery } from './web-only-delivery.service';
import { TelegramDelivery } from './telegram-delivery.service';

@Module({})
export class RoutineDeliveryModule {
  static forRoot(): DynamicModule {
    const telegramEnabled = process.env.MIKA_TELEGRAM_MODULE_ENABLED === 'true';

    if (telegramEnabled) {
      return {
        module: RoutineDeliveryModule,
        imports: [TelegramModule.forRoot()],
        providers: [
          { provide: ROUTINE_DELIVERY, useClass: TelegramDelivery },
        ],
        exports: [ROUTINE_DELIVERY],
      };
    }

    return {
      module: RoutineDeliveryModule,
      providers: [
        { provide: ROUTINE_DELIVERY, useClass: WebOnlyDelivery },
      ],
      exports: [ROUTINE_DELIVERY],
    };
  }
}

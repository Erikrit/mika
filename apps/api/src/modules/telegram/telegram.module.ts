import { DynamicModule, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TasksModule } from '../tasks/tasks.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { ReflectionsModule } from '../reflections/reflections.module';

@Module({})
export class TelegramModule {
  static forRoot(): DynamicModule {
    const enabled = process.env.MIKA_TELEGRAM_MODULE_ENABLED === 'true';

    if (!enabled) {
      return { module: TelegramModule };
    }

    return {
      module: TelegramModule,
      imports: [TasksModule, DashboardModule, ChatModule, AuthModule, ReflectionsModule],
      controllers: [TelegramController],
      providers: [TelegramService],
      exports: [TelegramService],
    };
  }
}

import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TasksModule } from '../tasks/tasks.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [TasksModule, DashboardModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}

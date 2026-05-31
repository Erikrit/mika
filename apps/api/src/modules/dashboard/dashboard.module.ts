import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TasksModule } from '../tasks/tasks.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TasksModule, EventsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

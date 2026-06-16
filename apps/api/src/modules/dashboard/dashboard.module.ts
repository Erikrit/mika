import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TasksModule } from '../tasks/tasks.module';
import { EventsModule } from '../events/events.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TasksModule, EventsModule, ProjectsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

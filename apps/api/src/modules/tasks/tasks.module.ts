import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MemoryModule } from '../memory/memory.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [MemoryModule, RemindersModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

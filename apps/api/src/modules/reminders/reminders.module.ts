import { Module } from '@nestjs/common';
import { ReminderQueueService } from './reminder-queue.service';
import { ReminderSchedulerService } from './reminder-scheduler.service';

@Module({
  providers: [ReminderQueueService, ReminderSchedulerService],
  exports: [ReminderSchedulerService],
})
export class RemindersModule {}

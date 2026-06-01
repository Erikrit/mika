import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { ReminderDispatchJob } from '@mika/shared';

const QUEUE_NAME = 'reminder-dispatch';

@Injectable()
export class ReminderQueueService implements OnModuleDestroy {
  private readonly queue = new Queue<ReminderDispatchJob>(QUEUE_NAME, {
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 200,
      removeOnFail: 500,
    },
  });

  async enqueueDispatch(
    reminderId: string,
    userId: string,
    scheduledAt: Date,
  ): Promise<void> {
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());
    await this.queue.add(
      'dispatch',
      { reminderId, userId },
      {
        jobId: `reminder-${reminderId}`,
        delay,
      },
    );
  }

  async cancelDispatch(reminderId: string): Promise<void> {
    const job = await this.queue.getJob(`reminder-${reminderId}`);
    if (job) await job.remove();
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

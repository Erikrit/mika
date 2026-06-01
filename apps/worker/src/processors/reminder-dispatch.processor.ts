import { Worker, type Job } from 'bullmq';
import type { ReminderDispatchJob } from '@mika/shared';
import type { PrismaClient } from '@mika/database';
import pino from 'pino';
import { ReminderDispatcherService } from '../services/reminder-dispatcher.service';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export function createReminderDispatchWorker(
  prisma: PrismaClient,
  connection: { host: string; port: number; password?: string },
): Worker<ReminderDispatchJob> {
  const dispatcher = new ReminderDispatcherService(prisma);

  const worker = new Worker<ReminderDispatchJob>(
    'reminder-dispatch',
    async (job: Job<ReminderDispatchJob>) => {
      await dispatcher.dispatch(job.data.reminderId);
    },
    {
      connection,
      concurrency: 3,
    },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'reminder-dispatch job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'reminder-dispatch job failed');
  });

  return worker;
}

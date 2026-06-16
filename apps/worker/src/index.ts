import pino from 'pino';
import { Worker } from 'bullmq';
import { PrismaClient } from '@mika/database';
import { createMemoryIndexWorker } from './processors/memory-index.processor';
import { createReminderDispatchWorker } from './processors/reminder-dispatch.processor';
import { ReminderDispatcherService } from './services/reminder-dispatcher.service';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});

const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

const prisma = new PrismaClient();

function envEnabled(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

const workers: Array<{ close: () => Promise<void> }> = [];
const timers: NodeJS.Timeout[] = [];
const enabledProcesses: string[] = [];

if (envEnabled('WORKER_NEGLECTED_JOBS_ENABLED', false)) {
  const neglectedWorker = new Worker(
    'neglected-tasks',
    async (job) => {
      logger.info({ jobId: job.id }, 'Processing neglected tasks job');
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const count = await prisma.task.updateMany({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS'] },
          updatedAt: { lt: sevenDaysAgo },
          neglectedSince: null,
        },
        data: { neglectedSince: new Date() },
      });

      logger.info({ count: count.count }, 'Marked tasks as neglected');
    },
    { connection: redisConnection },
  );

  neglectedWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'neglected-tasks job completed');
  });

  neglectedWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'neglected-tasks job failed');
  });

  workers.push(neglectedWorker);
  enabledProcesses.push('neglected-tasks');
}

if (envEnabled('WORKER_MEMORY_INDEX_ENABLED', true)) {
  workers.push(createMemoryIndexWorker(prisma, redisConnection));
  enabledProcesses.push('memory-index');
}

if (envEnabled('WORKER_REMINDER_DISPATCH_ENABLED', false)) {
  workers.push(createReminderDispatchWorker(prisma, redisConnection));
  enabledProcesses.push('reminder-dispatch');
}

if (envEnabled('WORKER_NEGLECTED_GOALS_ENABLED', false)) {
  const reminderDispatcher = new ReminderDispatcherService(prisma);
  const neglectedGoalsTimer = setInterval(async () => {
    try {
      await reminderDispatcher.processNeglectedGoals();
    } catch (err) {
      logger.error({ err }, 'neglected goals processing failed');
    }
  }, 24 * 60 * 60 * 1000);

  timers.push(neglectedGoalsTimer);
  enabledProcesses.push('neglected-goals');
}

logger.info({ enabledProcesses }, 'Worker started');

process.on('SIGTERM', async () => {
  logger.info('Shutting down worker...');
  for (const timer of timers) clearInterval(timer);
  await Promise.all(workers.map((worker) => worker.close()));
  await prisma.$disconnect();
  process.exit(0);
});

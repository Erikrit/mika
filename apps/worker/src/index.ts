import pino from 'pino';
import { Worker } from 'bullmq';
import { PrismaClient } from '@mika/database';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});

const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

const prisma = new PrismaClient();

// Worker: Neglected tasks checker
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
  logger.info({ jobId: job.id }, 'Job completed');
});

neglectedWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed');
});

logger.info('🔄 Worker started');

process.on('SIGTERM', async () => {
  logger.info('Shutting down worker...');
  await neglectedWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

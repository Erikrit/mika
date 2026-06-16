import { Worker, type Job } from 'bullmq';
import type { MemoryIndexJob } from '@mika/shared';
import { PrismaClient } from '@mika/database';
import pino from 'pino';
import { MemoryIndexerService } from '../services/memory-indexer.service';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

function readConcurrency(envName: string, fallback: number): number {
  const value = parseInt(process.env[envName] ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createMemoryIndexWorker(
  prisma: PrismaClient,
  connection: { host: string; port: number; password?: string },
): Worker<MemoryIndexJob> {
  const indexer = new MemoryIndexerService(prisma);

  const worker = new Worker<MemoryIndexJob>(
    'memory-index',
    async (job: Job<MemoryIndexJob>) => {
      await indexer.process(job.data);
    },
    {
      connection,
      concurrency: readConcurrency('MEMORY_INDEX_CONCURRENCY', 1),
    },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'memory-index job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'memory-index job failed');
  });

  return worker;
}

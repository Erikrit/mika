import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { MemoryIndexJob, MemorySourceType } from '@mika/shared';

const QUEUE_NAME = 'memory-index';

@Injectable()
export class MemoryQueueService implements OnModuleDestroy {
  private readonly queue = new Queue<MemoryIndexJob>(QUEUE_NAME, {
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  async enqueueUpsert(
    userId: string,
    sourceType: MemorySourceType,
    sourceId: string,
    extra?: Partial<
      Pick<
        MemoryIndexJob,
        | 'content'
        | 'lifeAreaId'
        | 'documentId'
        | 'memoryType'
        | 'privacyLevel'
        | 'category'
        | 'importance'
        | 'confidenceType'
        | 'confidenceScore'
        | 'enabledForRag'
        | 'metadata'
      >
    >,
  ): Promise<void> {
    await this.queue.add('index', {
      userId,
      sourceType,
      sourceId,
      action: 'upsert',
      ...extra,
    });
  }

  async enqueueDelete(
    userId: string,
    sourceType: MemorySourceType,
    sourceId: string,
  ): Promise<void> {
    await this.queue.add('index', {
      userId,
      sourceType,
      sourceId,
      action: 'delete',
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

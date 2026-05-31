import pino from 'pino';
import { PrismaClient } from '@mika/database';
import {
  buildGoalContent,
  buildProjectContent,
  buildReflectionContent,
  buildTaskContent,
  chunkMarkdown,
  chunkPlainText,
  computeContentHash,
  generateEmbedding,
  shouldIndexContent,
} from '@mika/ai';
import type { MemoryIndexJob, MemorySourceType } from '@mika/shared';
import { decryptReflection } from '../utils/encryption';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export class MemoryIndexerService {
  constructor(private readonly prisma: PrismaClient) {}

  async process(job: MemoryIndexJob): Promise<void> {
    if (job.action === 'delete') {
      await this.prisma.memoryChunk.deleteMany({
        where: {
          userId: job.userId,
          sourceType: job.sourceType,
          sourceId: job.sourceId,
        },
      });
      return;
    }

    const payload = await this.buildIndexableContent(job);
    if (!payload) return;

    await this.prisma.memoryChunk.deleteMany({
      where: {
        userId: job.userId,
        sourceType: job.sourceType,
        sourceId: job.sourceId,
      },
    });

    for (const chunk of payload.chunks) {
      if (!shouldIndexContent(chunk)) continue;

      const contentHash = computeContentHash(
        job.userId,
        job.sourceType,
        job.sourceId,
        chunk,
      );

      const embedding = await generateEmbedding(chunk);
      const vector = `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        INSERT INTO memory_chunks (
          id, "userId", "lifeAreaId", "sourceType", "sourceId",
          content, "contentHash", embedding, metadata, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${job.userId},
          ${payload.lifeAreaId},
          ${job.sourceType}::"MemorySourceType",
          ${job.sourceId},
          ${chunk},
          ${contentHash},
          ${vector}::vector,
          ${JSON.stringify(payload.metadata)}::jsonb,
          NOW(),
          NOW()
        )
        ON CONFLICT ("userId", "contentHash")
        DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          metadata = EXCLUDED.metadata,
          "lifeAreaId" = EXCLUDED."lifeAreaId",
          "updatedAt" = NOW()
      `;
    }

    logger.info(
      { userId: job.userId, sourceType: job.sourceType, sourceId: job.sourceId, count: payload.chunks.length },
      'memory indexed',
    );
  }

  private async buildIndexableContent(job: MemoryIndexJob): Promise<{
    chunks: string[];
    lifeAreaId: string | null;
    metadata: Record<string, unknown>;
  } | null> {
    const { userId, sourceType, sourceId } = job;

    switch (sourceType as MemorySourceType) {
      case 'TASK': {
        const task = await this.prisma.task.findFirst({
          where: { id: sourceId, userId },
          include: { project: { select: { title: true } } },
        });
        if (!task) return null;
        const text = buildTaskContent({
          title: task.title,
          description: task.description,
          projectTitle: task.project?.title,
        });
        if (!shouldIndexContent(text)) return null;
        return {
          chunks: chunkPlainText(text),
          lifeAreaId: task.lifeAreaId,
          metadata: { title: task.title },
        };
      }
      case 'PROJECT': {
        const project = await this.prisma.project.findFirst({
          where: { id: sourceId, userId },
        });
        if (!project) return null;
        const text = buildProjectContent({
          title: project.title,
          description: project.description,
          tags: project.tags,
        });
        if (!shouldIndexContent(text)) return null;
        return {
          chunks: chunkPlainText(text),
          lifeAreaId: project.lifeAreaId,
          metadata: { title: project.title },
        };
      }
      case 'GOAL': {
        const goal = await this.prisma.goal.findFirst({
          where: { id: sourceId, userId },
        });
        if (!goal) return null;
        const text = buildGoalContent({
          title: goal.title,
          description: goal.description,
          horizon: goal.horizon,
          progress: goal.progress,
        });
        if (!shouldIndexContent(text)) return null;
        return {
          chunks: chunkPlainText(text),
          lifeAreaId: goal.lifeAreaId,
          metadata: { title: goal.title },
        };
      }
      case 'REFLECTION': {
        const reflection = await this.prisma.reflection.findFirst({
          where: { id: sourceId, userId },
        });
        if (!reflection) return null;
        const decrypted = decryptReflection(reflection.content);
        const text = buildReflectionContent(decrypted);
        if (!shouldIndexContent(text)) return null;
        return {
          chunks: chunkPlainText(text),
          lifeAreaId: null,
          metadata: { createdAt: reflection.createdAt.toISOString() },
        };
      }
      case 'IMPORT':
      case 'NOTE': {
        if (!job.content) return null;
        const text = job.content;
        if (!shouldIndexContent(text)) return null;
        return {
          chunks: chunkMarkdown(text),
          lifeAreaId: job.lifeAreaId ?? null,
          metadata: job.metadata ?? {},
        };
      }
      default:
        return null;
    }
  }
}

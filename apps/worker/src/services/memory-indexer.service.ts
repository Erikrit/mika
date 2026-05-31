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
  classifyCrudSource,
  classifyDocumentHeuristic,
} from '@mika/ai';
import type { MemoryIndexJob, MemorySourceType } from '@mika/shared';
import { decryptReflection } from '../utils/encryption';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const CRUD_SOURCES: MemorySourceType[] = ['TASK', 'PROJECT', 'GOAL', 'REFLECTION'];

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

    const deleteWhere = job.documentId
      ? { userId: job.userId, documentId: job.documentId }
      : { userId: job.userId, sourceType: job.sourceType, sourceId: job.sourceId };

    await this.prisma.memoryChunk.deleteMany({ where: deleteWhere });

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
      const gov = payload.governance;

      await this.prisma.$executeRaw`
        INSERT INTO memory_chunks (
          id, "userId", "lifeAreaId", "documentId", "sourceType", "sourceId",
          content, "contentHash", embedding, metadata,
          "memoryType", "privacyLevel", importance, "confidenceType", "confidenceScore",
          "enabledForRag", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${job.userId},
          ${payload.lifeAreaId},
          ${job.documentId ?? null},
          ${job.sourceType}::"MemorySourceType",
          ${job.sourceId},
          ${chunk},
          ${contentHash},
          ${vector}::vector,
          ${JSON.stringify(payload.metadata)}::jsonb,
          ${gov.memoryType}::"MemoryType",
          ${gov.privacyLevel}::"PrivacyLevel",
          ${gov.importance},
          ${gov.confidenceType}::"ConfidenceType",
          ${gov.confidenceScore},
          ${gov.enabledForRag},
          NOW(),
          NOW()
        )
        ON CONFLICT ("userId", "contentHash")
        DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          metadata = EXCLUDED.metadata,
          "lifeAreaId" = EXCLUDED."lifeAreaId",
          "documentId" = EXCLUDED."documentId",
          "memoryType" = EXCLUDED."memoryType",
          "privacyLevel" = EXCLUDED."privacyLevel",
          importance = EXCLUDED.importance,
          "confidenceType" = EXCLUDED."confidenceType",
          "confidenceScore" = EXCLUDED."confidenceScore",
          "enabledForRag" = EXCLUDED."enabledForRag",
          "updatedAt" = NOW()
      `;
    }

    logger.info(
      {
        userId: job.userId,
        sourceType: job.sourceType,
        sourceId: job.sourceId,
        documentId: job.documentId,
        count: payload.chunks.length,
      },
      'memory indexed',
    );
  }

  private resolveGovernance(job: MemoryIndexJob, title?: string) {
    if (job.memoryType) {
      return {
        memoryType: job.memoryType,
        privacyLevel: job.privacyLevel ?? 'PRIVATE',
        importance: job.importance ?? 3,
        confidenceType: job.confidenceType ?? 'FACT',
        confidenceScore: job.confidenceScore ?? 1.0,
        enabledForRag: job.enabledForRag ?? true,
      };
    }

    if (CRUD_SOURCES.includes(job.sourceType)) {
      const crud = classifyCrudSource();
      return { ...crud, enabledForRag: true };
    }

    if (job.sourceType === 'IMPORT' && job.content) {
      const classified = classifyDocumentHeuristic({
        title: title ?? String(job.metadata?.filename ?? 'import'),
        content: job.content,
        categoryHint: job.category,
      });
      return {
        memoryType: classified.memoryType,
        privacyLevel: classified.privacyLevel,
        importance: classified.importance,
        confidenceType: classified.confidenceType,
        confidenceScore: classified.confidenceScore,
        enabledForRag: job.enabledForRag ?? true,
      };
    }

    return {
      memoryType: 'EVOLUTIVE' as const,
      privacyLevel: 'PRIVATE' as const,
      importance: 3,
      confidenceType: 'FACT' as const,
      confidenceScore: 1.0,
      enabledForRag: true,
    };
  }

  private async buildIndexableContent(job: MemoryIndexJob): Promise<{
    chunks: string[];
    lifeAreaId: string | null;
    metadata: Record<string, unknown>;
    governance: ReturnType<MemoryIndexerService['resolveGovernance']>;
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
          governance: this.resolveGovernance(job, task.title),
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
          governance: this.resolveGovernance(job, project.title),
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
          governance: this.resolveGovernance(job, goal.title),
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
          governance: this.resolveGovernance(job),
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
          metadata: {
            ...(job.metadata ?? {}),
            category: job.category,
            documentId: job.documentId,
          },
          governance: this.resolveGovernance(
            job,
            String(job.metadata?.filename ?? job.metadata?.title ?? 'import'),
          ),
        };
      }
      default:
        return null;
    }
  }
}

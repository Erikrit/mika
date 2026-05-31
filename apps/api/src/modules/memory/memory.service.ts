import { Injectable } from '@nestjs/common';
import {
  buildRetrievalFilters,
  detectIntent,
  FALLBACK_SIMILARITY_THRESHOLD,
  formatMemoryContext,
  chunkMarkdown,
  parseMarkdownFrontmatter,
  shouldIndexContent,
  isPriorityIntent,
  isUuid,
  buildFixedProfileContext,
  PRIORITY_EXPANDED_QUERY,
} from '@mika/ai';
import type { MemoryAuditChannel, MemorySourceType, RetrievedChunk } from '@mika/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryRepository } from './memory.repository';
import { MemoryQueueService } from './memory-queue.service';
import { ContextDocumentService } from './context-document.service';

export type RetrieveContextResult = {
  context: string;
  sensitiveChunkIds: string[];
  fixedProfile: string;
};

@Injectable()
export class MemoryService {
  constructor(
    private readonly repository: MemoryRepository,
    private readonly queue: MemoryQueueService,
    private readonly prisma: PrismaService,
    private readonly contextDocuments: ContextDocumentService,
  ) {}

  async getFixedProfileContext(userId: string): Promise<string> {
    const fixedChunks = await this.repository.findFixedProfileChunks(userId, 2);
    return buildFixedProfileContext(fixedChunks);
  }

  async retrieveContext(
    userId: string,
    query: string,
    lifeAreaId?: string,
  ): Promise<RetrieveContextResult> {
    const intent = detectIntent(query);
    const filters = buildRetrievalFilters(intent);

    let chunks = await this.repository.hybridSearch(
      userId,
      query,
      lifeAreaId,
      5,
      undefined,
      filters,
    );

    if (chunks.length === 0 && isPriorityIntent(query)) {
      chunks = await this.repository.hybridSearch(
        userId,
        PRIORITY_EXPANDED_QUERY,
        lifeAreaId,
        5,
        undefined,
        filters,
      );
    }

    if (chunks.length === 0) {
      chunks = await this.repository.hybridSearch(
        userId,
        isPriorityIntent(query) ? PRIORITY_EXPANDED_QUERY : query,
        lifeAreaId,
        5,
        FALLBACK_SIMILARITY_THRESHOLD,
        filters,
      );
    }

    const fixedChunks = await this.repository.findFixedProfileChunks(userId, 2);
    const sensitiveChunkIds = chunks
      .filter((c) => c.privacyLevel === 'SENSITIVE' || c.memoryType === 'SENSITIVE')
      .map((c) => c.id);

    return {
      context: formatMemoryContext(chunks),
      sensitiveChunkIds,
      fixedProfile: buildFixedProfileContext(fixedChunks),
    };
  }

  async auditRetrievedChunks(
    userId: string,
    chunkIds: string[],
    channel: MemoryAuditChannel,
  ): Promise<void> {
    await this.repository.auditSensitiveUsage(userId, chunkIds, channel);
  }

  async search(userId: string, query: string, lifeAreaId?: string) {
    const filters = buildRetrievalFilters(detectIntent(query));
    return this.repository.hybridSearch(userId, query, lifeAreaId, 10, undefined, filters);
  }

  async listChunks(userId: string, lifeAreaId?: string) {
    return this.repository.listChunks(userId, lifeAreaId);
  }

  updateChunk(userId: string, chunkId: string, data: Parameters<MemoryRepository['updateChunk']>[2]) {
    return this.repository.updateChunk(userId, chunkId, data);
  }

  deleteChunk(userId: string, chunkId: string) {
    return this.repository.deleteChunk(userId, chunkId);
  }

  getHealth(userId: string) {
    return this.repository.getHealth(userId);
  }

  listAudit(userId: string, page?: number, limit?: number) {
    return this.repository.listAudit(userId, page, limit);
  }

  private async resolveLifeArea(userId: string, lifeAreaRef?: string) {
    if (!lifeAreaRef) return null;

    if (isUuid(lifeAreaRef)) {
      return this.prisma.lifeArea.findFirst({
        where: { id: lifeAreaRef, userId },
      });
    }

    return this.prisma.lifeArea.findFirst({
      where: { slug: lifeAreaRef, userId },
    });
  }

  async importMarkdown(
    userId: string,
    filename: string,
    content: string,
    lifeAreaRef?: string,
    documentId?: string,
    metadata?: {
      title?: string;
      category?: string;
      memoryType?: string;
      privacyLevel?: string;
    },
  ) {
    const { frontmatter, body } = parseMarkdownFrontmatter(content);
    const areaRef = lifeAreaRef ?? String(frontmatter.area ?? '');
    let lifeAreaId: string | null = null;

    if (areaRef) {
      const area = await this.resolveLifeArea(userId, areaRef);
      lifeAreaId = area?.id ?? null;
    }

    const title =
      metadata?.title ??
      String(frontmatter.title ?? filename.replace(/\.(md|txt)$/i, ''));

    if (documentId) {
      const result = await this.contextDocuments.reimport(userId, documentId, content);
      return { imported: chunkMarkdown(body || content).length, documentId, reimport: true, ...result };
    }

    const doc = await this.contextDocuments.create(userId, {
      title,
      content,
      category: (metadata?.category ?? frontmatter.category) as never,
      memoryType: (metadata?.memoryType ?? frontmatter.memoryType) as never,
      privacyLevel: (metadata?.privacyLevel ?? frontmatter.privacy) as never,
    });

    return {
      imported: chunkMarkdown(body || content).length,
      documentId: doc.id,
      lifeAreaId,
      queued: true,
    };
  }

  enqueueUpsert(userId: string, sourceType: MemorySourceType, sourceId: string) {
    return this.queue.enqueueUpsert(userId, sourceType, sourceId);
  }

  enqueueDelete(userId: string, sourceType: MemorySourceType, sourceId: string) {
    return this.queue.enqueueDelete(userId, sourceType, sourceId);
  }
}

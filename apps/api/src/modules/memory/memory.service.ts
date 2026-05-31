import { Injectable } from '@nestjs/common';
import {
  FALLBACK_SIMILARITY_THRESHOLD,
  PRIORITY_EXPANDED_QUERY,
  formatMemoryContext,
  chunkMarkdown,
  parseMarkdownFrontmatter,
  shouldIndexContent,
  isPriorityIntent,
  isUuid,
} from '@mika/ai';
import type { MemorySourceType } from '@mika/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryRepository } from './memory.repository';
import { MemoryQueueService } from './memory-queue.service';

@Injectable()
export class MemoryService {
  constructor(
    private readonly repository: MemoryRepository,
    private readonly queue: MemoryQueueService,
    private readonly prisma: PrismaService,
  ) {}

  async retrieveContext(
    userId: string,
    query: string,
    lifeAreaId?: string,
  ): Promise<string> {
    let chunks = await this.repository.hybridSearch(userId, query, lifeAreaId, 5);

    if (chunks.length === 0 && isPriorityIntent(query)) {
      chunks = await this.repository.hybridSearch(
        userId,
        PRIORITY_EXPANDED_QUERY,
        lifeAreaId,
        5,
      );
    }

    if (chunks.length === 0) {
      chunks = await this.repository.hybridSearch(
        userId,
        isPriorityIntent(query) ? PRIORITY_EXPANDED_QUERY : query,
        lifeAreaId,
        5,
        FALLBACK_SIMILARITY_THRESHOLD,
      );
    }

    return formatMemoryContext(chunks);
  }

  async search(userId: string, query: string, lifeAreaId?: string) {
    return this.repository.hybridSearch(userId, query, lifeAreaId, 10);
  }

  async listChunks(userId: string, lifeAreaId?: string) {
    return this.repository.listChunks(userId, lifeAreaId);
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
  ) {
    const { frontmatter, body } = parseMarkdownFrontmatter(content);
    const areaRef = lifeAreaRef ?? frontmatter.area;
    let lifeAreaId: string | null = null;

    if (areaRef) {
      const area = await this.resolveLifeArea(userId, areaRef);
      lifeAreaId = area?.id ?? null;
    }

    const sourceId = `import:${filename}:${Date.now()}`;
    const chunks = chunkMarkdown(body);

    if (chunks.length === 0 || !shouldIndexContent(body)) {
      return { imported: 0, sourceId };
    }

    await this.queue.enqueueUpsert(userId, 'IMPORT', sourceId, {
      content: body,
      lifeAreaId,
      metadata: { filename, importedAt: new Date().toISOString() },
    });

    return { imported: chunks.length, sourceId, lifeAreaId, queued: true };
  }

  enqueueUpsert(userId: string, sourceType: MemorySourceType, sourceId: string) {
    return this.queue.enqueueUpsert(userId, sourceType, sourceId);
  }

  enqueueDelete(userId: string, sourceType: MemorySourceType, sourceId: string) {
    return this.queue.enqueueDelete(userId, sourceType, sourceId);
  }
}

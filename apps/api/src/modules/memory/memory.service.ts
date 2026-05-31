import { Injectable } from '@nestjs/common';
import { formatMemoryContext } from '@mika/ai';
import { chunkMarkdown, parseMarkdownFrontmatter, shouldIndexContent } from '@mika/ai';
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
    const chunks = await this.repository.hybridSearch(userId, query, lifeAreaId, 5);
    return formatMemoryContext(chunks);
  }

  async search(userId: string, query: string, lifeAreaId?: string) {
    return this.repository.hybridSearch(userId, query, lifeAreaId, 10);
  }

  async listChunks(userId: string, lifeAreaId?: string) {
    return this.repository.listChunks(userId, lifeAreaId);
  }

  async importMarkdown(
    userId: string,
    filename: string,
    content: string,
    lifeAreaSlug?: string,
  ) {
    const { frontmatter, body } = parseMarkdownFrontmatter(content);
    const areaSlug = lifeAreaSlug ?? frontmatter.area;
    let lifeAreaId: string | null = null;

    if (areaSlug) {
      const area = await this.prisma.lifeArea.findFirst({
        where: { userId, slug: areaSlug },
      });
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

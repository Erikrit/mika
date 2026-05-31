import { Injectable } from '@nestjs/common';
import {
  classifyDocument,
  chunkMarkdown,
  parseMarkdownFrontmatter,
  shouldIndexContent,
} from '@mika/ai';
import type {
  ContextCategory,
  CreateContextDocumentDto,
  UpdateContextDocumentDto,
} from '@mika/shared';
import { ContextDocumentRepository } from './context-document.repository';
import { MemoryQueueService } from './memory-queue.service';

@Injectable()
export class ContextDocumentService {
  constructor(
    private readonly repository: ContextDocumentRepository,
    private readonly queue: MemoryQueueService,
  ) {}

  list(userId: string, includeArchived?: boolean) {
    return this.repository.findAll(userId, includeArchived);
  }

  get(userId: string, id: string) {
    return this.repository.findOne(userId, id);
  }

  getVersions(userId: string, id: string, preview?: boolean) {
    return this.repository.findVersions(userId, id, preview);
  }

  getVersion(userId: string, id: string, versionId: string) {
    return this.repository.findVersion(userId, id, versionId);
  }

  async create(userId: string, dto: CreateContextDocumentDto) {
    const { frontmatter, body } = parseMarkdownFrontmatter(dto.content);
    const title = dto.title || String(frontmatter.title ?? 'Documento sem título');
    const classification = await classifyDocument({
      title,
      content: dto.content,
      categoryHint: dto.category,
    });

    const doc = await this.repository.create(userId, {
      ...dto,
      title,
      content: body || dto.content,
      category: dto.category ?? classification.category,
      memoryType: dto.memoryType ?? classification.memoryType,
      privacyLevel: dto.privacyLevel ?? classification.privacyLevel,
      enabledForRag: dto.enabledForRag ?? true,
      retentionType: dto.retentionType ?? 'LONG_TERM',
    });

    await this.enqueueIndex(userId, doc.id, body || dto.content, {
      category: doc.category,
      memoryType: doc.memoryType,
      privacyLevel: doc.privacyLevel,
      enabledForRag: doc.enabledForRag,
      importance: classification.importance,
      confidenceType: classification.confidenceType,
      confidenceScore: classification.confidenceScore,
    });

    return doc;
  }

  async reimport(userId: string, id: string, content: string) {
    const { body } = parseMarkdownFrontmatter(content);
    const text = body || content;
    const result = await this.repository.addVersion(userId, id, text);
    const doc = await this.repository.findOne(userId, id);

    const classification = await classifyDocument({
      title: doc.title,
      content: text,
      categoryHint: doc.category,
    });

    await this.enqueueIndex(userId, id, text, {
      category: doc.category,
      memoryType: doc.memoryType,
      privacyLevel: doc.privacyLevel,
      enabledForRag: doc.enabledForRag,
      importance: classification.importance,
      confidenceType: classification.confidenceType,
      confidenceScore: classification.confidenceScore,
    });

    return result;
  }

  async update(userId: string, id: string, dto: UpdateContextDocumentDto) {
    const updated = await this.repository.update(userId, id, dto);

    const needsChunkSync =
      dto.memoryType != null || dto.privacyLevel != null || dto.enabledForRag != null;

    if (needsChunkSync) {
      await this.repository.syncChunksGovernance(id, {
        ...(dto.memoryType != null ? { memoryType: dto.memoryType } : {}),
        ...(dto.privacyLevel != null ? { privacyLevel: dto.privacyLevel } : {}),
        ...(dto.enabledForRag != null ? { enabledForRag: dto.enabledForRag } : {}),
      });
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    await this.repository.remove(userId, id);
    return { deleted: true };
  }

  private async enqueueIndex(
    userId: string,
    documentId: string,
    content: string,
    meta: {
      category: ContextCategory;
      memoryType: string;
      privacyLevel: string;
      enabledForRag: boolean;
      importance: number;
      confidenceType: string;
      confidenceScore: number;
    },
  ) {
    if (!shouldIndexContent(content)) return;

    const chunks = chunkMarkdown(content);
    await this.queue.enqueueUpsert(userId, 'IMPORT', `doc:${documentId}`, {
      content,
      documentId,
      memoryType: meta.memoryType as never,
      privacyLevel: meta.privacyLevel as never,
      category: meta.category,
      importance: meta.importance,
      confidenceType: meta.confidenceType as never,
      confidenceScore: meta.confidenceScore,
      enabledForRag: meta.enabledForRag,
      metadata: {
        documentId,
        category: meta.category,
        chunkCount: chunks.length,
      },
    });
  }
}

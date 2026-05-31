import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AI_CONFIG,
  embeddingToVectorLiteral,
  generateEmbedding,
  hybridRetrieve,
} from '@mika/ai';
import type {
  MemoryAuditChannel,
  MemoryHealthMetrics,
  MemorySourceType,
  MemoryType,
  PrivacyLevel,
  RetrievedChunk,
  RetrievalFilters,
  UpdateMemoryChunkDto,
} from '@mika/shared';
import { PrismaService } from '../prisma/prisma.service';

type RawChunkRow = {
  id: string;
  content: string;
  sourceType: MemorySourceType;
  sourceId: string | null;
  lifeAreaId: string | null;
  lifeAreaLabel: string | null;
  documentId: string | null;
  memoryType: MemoryType;
  privacyLevel: PrivacyLevel;
  importance: number;
  confidenceType: string;
  confidenceScore: number;
  enabledForRag: boolean;
  retentionType: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  contentHash: string;
  score: number;
};

@Injectable()
export class MemoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildSearchSql(filters?: RetrievalFilters): { join: string; filterSql: string } {
    const parts: string[] = ['mc."archivedAt" IS NULL'];
    let join = '';

    if (filters?.excludeDisabledRag !== false) {
      parts.push('mc."enabledForRag" = true');
    }

    if (filters?.memoryTypes?.length) {
      const types = filters.memoryTypes.map((t) => `'${t}'`).join(',');
      parts.push(`mc."memoryType"::text IN (${types})`);
    }

    if (filters?.categories?.length) {
      join = 'LEFT JOIN context_documents cd ON cd.id = mc."documentId"';
      const cats = filters.categories.map((c) => `'${c}'`).join(',');
      parts.push(`(cd.category IN (${cats}) OR mc."documentId" IS NULL)`);
    }

    return {
      join,
      filterSql: parts.length ? `AND ${parts.join(' AND ')}` : '',
    };
  }

  async deleteBySource(
    userId: string,
    sourceType: MemorySourceType,
    sourceId: string,
  ): Promise<void> {
    await this.prisma.memoryChunk.deleteMany({
      where: { userId, sourceType, sourceId },
    });
  }

  async upsertChunk(input: {
    userId: string;
    lifeAreaId?: string | null;
    documentId?: string | null;
    sourceType: MemorySourceType;
    sourceId?: string | null;
    content: string;
    contentHash: string;
    embedding: number[];
    memoryType?: MemoryType;
    privacyLevel?: PrivacyLevel;
    importance?: number;
    confidenceType?: string;
    confidenceScore?: number;
    enabledForRag?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const vector = embeddingToVectorLiteral(input.embedding);
    await this.prisma.$executeRaw`
      INSERT INTO memory_chunks (
        id, "userId", "lifeAreaId", "documentId", "sourceType", "sourceId",
        content, "contentHash", embedding, metadata,
        "memoryType", "privacyLevel", importance, "confidenceType", "confidenceScore",
        "enabledForRag", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${input.userId},
        ${input.lifeAreaId ?? null},
        ${input.documentId ?? null},
        ${input.sourceType}::"MemorySourceType",
        ${input.sourceId ?? null},
        ${input.content},
        ${input.contentHash},
        ${vector}::vector,
        ${JSON.stringify(input.metadata ?? {})}::jsonb,
        ${(input.memoryType ?? 'EVOLUTIVE')}::"MemoryType",
        ${(input.privacyLevel ?? 'PRIVATE')}::"PrivacyLevel",
        ${input.importance ?? 3},
        ${(input.confidenceType ?? 'FACT')}::"ConfidenceType",
        ${input.confidenceScore ?? 1.0},
        ${input.enabledForRag ?? true},
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

  private mapRow(row: RawChunkRow): RetrievedChunk {
    return {
      id: row.id,
      content: row.content,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      lifeAreaId: row.lifeAreaId,
      lifeAreaLabel: row.lifeAreaLabel ?? undefined,
      documentId: row.documentId,
      memoryType: row.memoryType,
      privacyLevel: row.privacyLevel,
      importance: row.importance,
      confidenceType: row.confidenceType as RetrievedChunk['confidenceType'],
      confidenceScore: row.confidenceScore,
      enabledForRag: row.enabledForRag,
      retentionType: row.retentionType as RetrievedChunk['retentionType'],
      metadata: row.metadata ?? {},
      createdAt: new Date(row.createdAt),
      contentHash: row.contentHash,
      vectorScore: Number(row.score),
    };
  }

  async vectorSearch(
    userId: string,
    queryEmbedding: number[],
    options: {
      lifeAreaId?: string;
      similarityThreshold?: number;
      filters?: RetrievalFilters;
    } = {},
  ): Promise<RetrievedChunk[]> {
    const vector = embeddingToVectorLiteral(queryEmbedding);
    const threshold =
      options.similarityThreshold ??
      options.filters?.minScore ??
      AI_CONFIG.similarityThreshold;
    const { join, filterSql } = this.buildSearchSql(options.filters);

    const rows = options.lifeAreaId
      ? await this.prisma.$queryRawUnsafe<RawChunkRow[]>(`
          SELECT
            mc.id, mc.content, mc."sourceType" AS "sourceType", mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId", la.label AS "lifeAreaLabel",
            mc."documentId" AS "documentId", mc."memoryType" AS "memoryType",
            mc."privacyLevel" AS "privacyLevel", mc.importance,
            mc."confidenceType" AS "confidenceType", mc."confidenceScore" AS "confidenceScore",
            mc."enabledForRag" AS "enabledForRag", mc."retentionType" AS "retentionType",
            mc.metadata, mc."createdAt" AS "createdAt", mc."contentHash" AS "contentHash",
            (1 - (mc.embedding <=> '${vector}'::vector)) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          ${join}
          WHERE mc."userId" = '${userId}'
            AND mc.embedding IS NOT NULL
            AND (1 - (mc.embedding <=> '${vector}'::vector)) > ${threshold}
            AND mc."lifeAreaId" = '${options.lifeAreaId}'
            ${filterSql}
          ORDER BY mc.embedding <=> '${vector}'::vector
          LIMIT 10
        `)
      : await this.prisma.$queryRawUnsafe<RawChunkRow[]>(`
          SELECT
            mc.id, mc.content, mc."sourceType" AS "sourceType", mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId", la.label AS "lifeAreaLabel",
            mc."documentId" AS "documentId", mc."memoryType" AS "memoryType",
            mc."privacyLevel" AS "privacyLevel", mc.importance,
            mc."confidenceType" AS "confidenceType", mc."confidenceScore" AS "confidenceScore",
            mc."enabledForRag" AS "enabledForRag", mc."retentionType" AS "retentionType",
            mc.metadata, mc."createdAt" AS "createdAt", mc."contentHash" AS "contentHash",
            (1 - (mc.embedding <=> '${vector}'::vector)) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          ${join}
          WHERE mc."userId" = '${userId}'
            AND mc.embedding IS NOT NULL
            AND (1 - (mc.embedding <=> '${vector}'::vector)) > ${threshold}
            ${filterSql}
          ORDER BY mc.embedding <=> '${vector}'::vector
          LIMIT 10
        `);

    return rows.map((row) => this.mapRow(row));
  }

  async fullTextSearch(
    userId: string,
    query: string,
    lifeAreaId?: string,
    filters?: RetrievalFilters,
  ): Promise<RetrievedChunk[]> {
    const { join, filterSql } = this.buildSearchSql(filters);
    const safeQuery = query.replace(/'/g, "''");

    const rows = lifeAreaId
      ? await this.prisma.$queryRawUnsafe<RawChunkRow[]>(`
          SELECT
            mc.id, mc.content, mc."sourceType" AS "sourceType", mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId", la.label AS "lifeAreaLabel",
            mc."documentId" AS "documentId", mc."memoryType" AS "memoryType",
            mc."privacyLevel" AS "privacyLevel", mc.importance,
            mc."confidenceType" AS "confidenceType", mc."confidenceScore" AS "confidenceScore",
            mc."enabledForRag" AS "enabledForRag", mc."retentionType" AS "retentionType",
            mc.metadata, mc."createdAt" AS "createdAt", mc."contentHash" AS "contentHash",
            ts_rank(mc.search_vector, plainto_tsquery('portuguese', '${safeQuery}')) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          ${join}
          WHERE mc."userId" = '${userId}'
            AND mc.search_vector @@ plainto_tsquery('portuguese', '${safeQuery}')
            AND mc."lifeAreaId" = '${lifeAreaId}'
            ${filterSql}
          ORDER BY score DESC
          LIMIT 5
        `)
      : await this.prisma.$queryRawUnsafe<RawChunkRow[]>(`
          SELECT
            mc.id, mc.content, mc."sourceType" AS "sourceType", mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId", la.label AS "lifeAreaLabel",
            mc."documentId" AS "documentId", mc."memoryType" AS "memoryType",
            mc."privacyLevel" AS "privacyLevel", mc.importance,
            mc."confidenceType" AS "confidenceType", mc."confidenceScore" AS "confidenceScore",
            mc."enabledForRag" AS "enabledForRag", mc."retentionType" AS "retentionType",
            mc.metadata, mc."createdAt" AS "createdAt", mc."contentHash" AS "contentHash",
            ts_rank(mc.search_vector, plainto_tsquery('portuguese', '${safeQuery}')) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          ${join}
          WHERE mc."userId" = '${userId}'
            AND mc.search_vector @@ plainto_tsquery('portuguese', '${safeQuery}')
            ${filterSql}
          ORDER BY score DESC
          LIMIT 5
        `);

    return rows.map((row) => ({
      ...this.mapRow(row),
      textScore: Number(row.score),
    }));
  }

  async hybridSearch(
    userId: string,
    query: string,
    lifeAreaId?: string,
    topK = 5,
    similarityThreshold?: number,
    filters?: RetrievalFilters,
  ): Promise<RetrievedChunk[]> {
    let vectorResults: RetrievedChunk[] = [];
    try {
      const queryEmbedding = await generateEmbedding(query);
      vectorResults = await this.vectorSearch(userId, queryEmbedding, {
        lifeAreaId,
        similarityThreshold,
        filters,
      });
    } catch {
      vectorResults = [];
    }

    const textResults = await this.fullTextSearch(userId, query, lifeAreaId, filters);
    return hybridRetrieve({
      vectorResults,
      textResults,
      lifeAreaId,
      topK,
    });
  }

  async findFixedProfileChunks(userId: string, limit = 2): Promise<RetrievedChunk[]> {
    const rows = await this.prisma.memoryChunk.findMany({
      where: {
        userId,
        memoryType: 'FIXED',
        enabledForRag: true,
        archivedAt: null,
      },
      orderBy: [{ importance: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      include: { lifeArea: { select: { label: true } } },
    });

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      lifeAreaId: row.lifeAreaId,
      lifeAreaLabel: row.lifeArea?.label,
      documentId: row.documentId,
      memoryType: row.memoryType,
      privacyLevel: row.privacyLevel,
      importance: row.importance,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.createdAt,
      contentHash: row.contentHash,
    }));
  }

  async listChunks(userId: string, lifeAreaId?: string) {
    return this.prisma.memoryChunk.findMany({
      where: {
        userId,
        archivedAt: null,
        ...(lifeAreaId ? { lifeAreaId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        lifeArea: { select: { label: true, slug: true, color: true } },
        document: { select: { id: true, title: true, category: true } },
      },
      take: 200,
    });
  }

  async updateChunk(userId: string, chunkId: string, data: UpdateMemoryChunkDto) {
    const chunk = await this.prisma.memoryChunk.findFirst({
      where: { id: chunkId, userId },
    });
    if (!chunk) throw new NotFoundException('Chunk não encontrado');

    return this.prisma.memoryChunk.update({
      where: { id: chunkId },
      data: {
        ...(data.memoryType != null ? { memoryType: data.memoryType } : {}),
        ...(data.privacyLevel != null ? { privacyLevel: data.privacyLevel } : {}),
        ...(data.enabledForRag != null ? { enabledForRag: data.enabledForRag } : {}),
        ...(data.importance != null ? { importance: data.importance } : {}),
      },
    });
  }

  async deleteChunk(userId: string, chunkId: string) {
    const chunk = await this.prisma.memoryChunk.findFirst({
      where: { id: chunkId, userId },
    });
    if (!chunk) throw new NotFoundException('Chunk não encontrado');
    await this.prisma.memoryChunk.delete({ where: { id: chunkId } });
    return { deleted: true };
  }

  async getHealth(userId: string): Promise<MemoryHealthMetrics> {
    const [
      totalChunks,
      totalDocuments,
      byType,
      byPrivacy,
      disabledForRag,
      archived,
      orphans,
      duplicates,
    ] = await Promise.all([
      this.prisma.memoryChunk.count({ where: { userId } }),
      this.prisma.contextDocument.count({ where: { userId } }),
      this.prisma.memoryChunk.groupBy({
        by: ['memoryType'],
        where: { userId },
        _count: true,
      }),
      this.prisma.memoryChunk.groupBy({
        by: ['privacyLevel'],
        where: { userId },
        _count: true,
      }),
      this.prisma.memoryChunk.count({ where: { userId, enabledForRag: false } }),
      this.prisma.memoryChunk.count({ where: { userId, archivedAt: { not: null } } }),
      this.prisma.memoryChunk.count({
        where: {
          userId,
          documentId: null,
          sourceType: 'IMPORT',
        },
      }),
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count FROM (
          SELECT "contentHash", COUNT(*) AS c
          FROM memory_chunks
          WHERE "userId" = ${userId}
          GROUP BY "contentHash"
          HAVING COUNT(*) > 1
        ) dup
      `,
    ]);

    const byMemoryType = {
      FIXED: 0,
      EVOLUTIVE: 0,
      SENSITIVE: 0,
    } as Record<MemoryType, number>;
    for (const row of byType) {
      byMemoryType[row.memoryType] = row._count;
    }

    const byPrivacyLevel = {
      PUBLIC: 0,
      PRIVATE: 0,
      SENSITIVE: 0,
    } as Record<PrivacyLevel, number>;
    for (const row of byPrivacy) {
      byPrivacyLevel[row.privacyLevel] = row._count;
    }

    return {
      totalChunks,
      totalDocuments,
      byMemoryType,
      byPrivacyLevel,
      duplicates: Number(duplicates[0]?.count ?? 0),
      orphans,
      disabledForRag,
      archived,
    };
  }

  async listAudit(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.memoryUsageAudit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          chunk: {
            select: {
              id: true,
              content: true,
              memoryType: true,
              privacyLevel: true,
              sourceType: true,
            },
          },
        },
      }),
      this.prisma.memoryUsageAudit.count({ where: { userId } }),
    ]);
    return { items, total, page, limit };
  }

  async auditSensitiveUsage(
    userId: string,
    chunkIds: string[],
    channel: MemoryAuditChannel,
  ): Promise<void> {
    if (chunkIds.length === 0) return;
    await this.prisma.memoryUsageAudit.createMany({
      data: chunkIds.map((chunkId) => ({ userId, chunkId, channel })),
    });
  }
}

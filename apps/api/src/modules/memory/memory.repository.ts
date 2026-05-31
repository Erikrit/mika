import { Injectable } from '@nestjs/common';
import {
  AI_CONFIG,
  embeddingToVectorLiteral,
  generateEmbedding,
  hybridRetrieve,
} from '@mika/ai';
import type { MemorySourceType, RetrievedChunk } from '@mika/shared';
import { PrismaService } from '../prisma/prisma.service';

type RawChunkRow = {
  id: string;
  content: string;
  sourceType: MemorySourceType;
  sourceId: string | null;
  lifeAreaId: string | null;
  lifeAreaLabel: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  contentHash: string;
  score: number;
};

@Injectable()
export class MemoryRepository {
  constructor(private readonly prisma: PrismaService) {}

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
    sourceType: MemorySourceType;
    sourceId?: string | null;
    content: string;
    contentHash: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const vector = embeddingToVectorLiteral(input.embedding);
    await this.prisma.$executeRaw`
      INSERT INTO memory_chunks (
        id, "userId", "lifeAreaId", "sourceType", "sourceId",
        content, "contentHash", embedding, metadata, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${input.userId},
        ${input.lifeAreaId ?? null},
        ${input.sourceType}::"MemorySourceType",
        ${input.sourceId ?? null},
        ${input.content},
        ${input.contentHash},
        ${vector}::vector,
        ${JSON.stringify(input.metadata ?? {})}::jsonb,
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

  async vectorSearch(
    userId: string,
    queryEmbedding: number[],
    lifeAreaId?: string,
    similarityThreshold: number = AI_CONFIG.similarityThreshold,
  ): Promise<RetrievedChunk[]> {
    const vector = embeddingToVectorLiteral(queryEmbedding);
    const threshold = similarityThreshold;

    const rows = lifeAreaId
      ? await this.prisma.$queryRaw<RawChunkRow[]>`
          SELECT
            mc.id,
            mc.content,
            mc."sourceType" AS "sourceType",
            mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId",
            la.label AS "lifeAreaLabel",
            mc.metadata,
            mc."createdAt" AS "createdAt",
            mc."contentHash" AS "contentHash",
            (1 - (mc.embedding <=> ${vector}::vector)) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          WHERE mc."userId" = ${userId}
            AND mc.embedding IS NOT NULL
            AND (1 - (mc.embedding <=> ${vector}::vector)) > ${threshold}
            AND mc."lifeAreaId" = ${lifeAreaId}
          ORDER BY mc.embedding <=> ${vector}::vector
          LIMIT 10
        `
      : await this.prisma.$queryRaw<RawChunkRow[]>`
          SELECT
            mc.id,
            mc.content,
            mc."sourceType" AS "sourceType",
            mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId",
            la.label AS "lifeAreaLabel",
            mc.metadata,
            mc."createdAt" AS "createdAt",
            mc."contentHash" AS "contentHash",
            (1 - (mc.embedding <=> ${vector}::vector)) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          WHERE mc."userId" = ${userId}
            AND mc.embedding IS NOT NULL
            AND (1 - (mc.embedding <=> ${vector}::vector)) > ${threshold}
          ORDER BY mc.embedding <=> ${vector}::vector
          LIMIT 10
        `;

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      lifeAreaId: row.lifeAreaId,
      lifeAreaLabel: row.lifeAreaLabel ?? undefined,
      metadata: row.metadata ?? {},
      createdAt: new Date(row.createdAt),
      contentHash: row.contentHash,
      vectorScore: Number(row.score),
    }));
  }

  async fullTextSearch(
    userId: string,
    query: string,
    lifeAreaId?: string,
  ): Promise<RetrievedChunk[]> {
    const rows = lifeAreaId
      ? await this.prisma.$queryRaw<RawChunkRow[]>`
          SELECT
            mc.id,
            mc.content,
            mc."sourceType" AS "sourceType",
            mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId",
            la.label AS "lifeAreaLabel",
            mc.metadata,
            mc."createdAt" AS "createdAt",
            mc."contentHash" AS "contentHash",
            ts_rank(mc.search_vector, plainto_tsquery('portuguese', ${query})) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          WHERE mc."userId" = ${userId}
            AND mc.search_vector @@ plainto_tsquery('portuguese', ${query})
            AND mc."lifeAreaId" = ${lifeAreaId}
          ORDER BY score DESC
          LIMIT 5
        `
      : await this.prisma.$queryRaw<RawChunkRow[]>`
          SELECT
            mc.id,
            mc.content,
            mc."sourceType" AS "sourceType",
            mc."sourceId" AS "sourceId",
            mc."lifeAreaId" AS "lifeAreaId",
            la.label AS "lifeAreaLabel",
            mc.metadata,
            mc."createdAt" AS "createdAt",
            mc."contentHash" AS "contentHash",
            ts_rank(mc.search_vector, plainto_tsquery('portuguese', ${query})) AS score
          FROM memory_chunks mc
          LEFT JOIN life_areas la ON la.id = mc."lifeAreaId"
          WHERE mc."userId" = ${userId}
            AND mc.search_vector @@ plainto_tsquery('portuguese', ${query})
          ORDER BY score DESC
          LIMIT 5
        `;

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      lifeAreaId: row.lifeAreaId,
      lifeAreaLabel: row.lifeAreaLabel ?? undefined,
      metadata: row.metadata ?? {},
      createdAt: new Date(row.createdAt),
      contentHash: row.contentHash,
      textScore: Number(row.score),
    }));
  }

  async hybridSearch(
    userId: string,
    query: string,
    lifeAreaId?: string,
    topK = 5,
    similarityThreshold?: number,
  ): Promise<RetrievedChunk[]> {
    let vectorResults: RetrievedChunk[] = [];
    try {
      const queryEmbedding = await generateEmbedding(query);
      vectorResults = await this.vectorSearch(
        userId,
        queryEmbedding,
        lifeAreaId,
        similarityThreshold,
      );
    } catch {
      vectorResults = [];
    }

    const textResults = await this.fullTextSearch(userId, query, lifeAreaId);
    return hybridRetrieve({
      vectorResults,
      textResults,
      lifeAreaId,
      topK,
    });
  }

  async listChunks(userId: string, lifeAreaId?: string) {
    return this.prisma.memoryChunk.findMany({
      where: {
        userId,
        ...(lifeAreaId ? { lifeAreaId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: { lifeArea: { select: { label: true, slug: true, color: true } } },
      take: 100,
    });
  }
}

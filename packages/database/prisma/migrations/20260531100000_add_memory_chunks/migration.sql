-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "MemorySourceType" AS ENUM ('TASK', 'PROJECT', 'GOAL', 'REFLECTION', 'NOTE', 'IMPORT');

-- CreateTable
CREATE TABLE "memory_chunks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lifeAreaId" TEXT,
    "sourceType" "MemorySourceType" NOT NULL,
    "sourceId" TEXT,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_chunks_pkey" PRIMARY KEY ("id")
);

-- Full-text search column
ALTER TABLE "memory_chunks"
ADD COLUMN "search_vector" tsvector
GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED;

-- CreateIndex
CREATE UNIQUE INDEX "memory_chunks_userId_contentHash_key" ON "memory_chunks"("userId", "contentHash");

-- CreateIndex
CREATE INDEX "memory_chunks_userId_sourceType_sourceId_idx" ON "memory_chunks"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "memory_chunks_search_vector_idx" ON "memory_chunks" USING GIN ("search_vector");

-- AddForeignKey
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_lifeAreaId_fkey" FOREIGN KEY ("lifeAreaId") REFERENCES "life_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

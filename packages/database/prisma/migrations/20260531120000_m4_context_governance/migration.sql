-- M4: Context documents, governance fields, audit log

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('FIXED', 'EVOLUTIVE', 'SENSITIVE');
CREATE TYPE "PrivacyLevel" AS ENUM ('PUBLIC', 'PRIVATE', 'SENSITIVE');
CREATE TYPE "ContextCategory" AS ENUM ('LIFE', 'WORK', 'FINANCE', 'PROJECT', 'ROUTINE', 'LEARNING', 'RELATIONSHIP', 'HEALTH', 'EMOTIONAL', 'MEMORY', 'CUSTOM');
CREATE TYPE "ConfidenceType" AS ENUM ('FACT', 'INFERRED', 'HYPOTHESIS');
CREATE TYPE "RetentionType" AS ENUM ('PERMANENT', 'LONG_TERM', 'SHORT_TERM', 'ARCHIVED');
CREATE TYPE "MemoryAuditChannel" AS ENUM ('CHAT', 'TELEGRAM', 'ROUTINE');

-- CreateTable
CREATE TABLE "context_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ContextCategory" NOT NULL DEFAULT 'CUSTOM',
    "memoryType" "MemoryType" NOT NULL DEFAULT 'EVOLUTIVE',
    "privacyLevel" "PrivacyLevel" NOT NULL DEFAULT 'PRIVATE',
    "source" TEXT NOT NULL DEFAULT 'import',
    "enabledForRag" BOOLEAN NOT NULL DEFAULT true,
    "retentionType" "RetentionType" NOT NULL DEFAULT 'LONG_TERM',
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "context_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "context_document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "context_document_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memory_usage_audits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "channel" "MemoryAuditChannel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_usage_audits_pkey" PRIMARY KEY ("id")
);

-- AlterTable memory_chunks
ALTER TABLE "memory_chunks" ADD COLUMN "documentId" TEXT;
ALTER TABLE "memory_chunks" ADD COLUMN "memoryType" "MemoryType" NOT NULL DEFAULT 'EVOLUTIVE';
ALTER TABLE "memory_chunks" ADD COLUMN "privacyLevel" "PrivacyLevel" NOT NULL DEFAULT 'PRIVATE';
ALTER TABLE "memory_chunks" ADD COLUMN "importance" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "memory_chunks" ADD COLUMN "confidenceType" "ConfidenceType" NOT NULL DEFAULT 'FACT';
ALTER TABLE "memory_chunks" ADD COLUMN "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE "memory_chunks" ADD COLUMN "enabledForRag" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "memory_chunks" ADD COLUMN "retentionType" "RetentionType" NOT NULL DEFAULT 'LONG_TERM';
ALTER TABLE "memory_chunks" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "context_documents_currentVersionId_key" ON "context_documents"("currentVersionId");
CREATE INDEX "context_documents_userId_category_idx" ON "context_documents"("userId", "category");
CREATE INDEX "context_documents_userId_archivedAt_idx" ON "context_documents"("userId", "archivedAt");
CREATE UNIQUE INDEX "context_document_versions_documentId_versionNumber_key" ON "context_document_versions"("documentId", "versionNumber");
CREATE INDEX "memory_usage_audits_userId_createdAt_idx" ON "memory_usage_audits"("userId", "createdAt");
CREATE INDEX "memory_chunks_userId_memoryType_enabledForRag_idx" ON "memory_chunks"("userId", "memoryType", "enabledForRag");
CREATE INDEX "memory_chunks_documentId_idx" ON "memory_chunks"("documentId");

-- AddForeignKey
ALTER TABLE "context_documents" ADD CONSTRAINT "context_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "context_document_versions" ADD CONSTRAINT "context_document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "context_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "context_documents" ADD CONSTRAINT "context_documents_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "context_document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "memory_chunks" ADD CONSTRAINT "memory_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "context_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memory_usage_audits" ADD CONSTRAINT "memory_usage_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memory_usage_audits" ADD CONSTRAINT "memory_usage_audits_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "memory_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

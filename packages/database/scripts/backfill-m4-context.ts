/**
 * Backfill M4 defaults on legacy memory chunks.
 * Usage: pnpm --filter @mika/database db:backfill-m4-context
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE memory_chunks
    SET
      "memoryType" = 'EVOLUTIVE'::"MemoryType",
      "privacyLevel" = 'PRIVATE'::"PrivacyLevel",
      "enabledForRag" = true,
      "confidenceType" = 'FACT'::"ConfidenceType",
      "confidenceScore" = 1.0,
      "retentionType" = 'LONG_TERM'::"RetentionType",
      "importance" = 3
    WHERE "documentId" IS NULL
      AND "memoryType" = 'EVOLUTIVE'::"MemoryType"
  `;

  console.log(`Backfill M4: ${result} chunk(s) verified with governance defaults.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

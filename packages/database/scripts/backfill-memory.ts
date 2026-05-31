/**
 * Backfill memory index for existing entities.
 * Usage: pnpm --filter @mika/database exec dotenv -e ../../.env -- ts-node scripts/backfill-memory.ts
 */
import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import type { MemoryIndexJob } from '@mika/shared';

const prisma = new PrismaClient();

const queue = new Queue<MemoryIndexJob>('memory-index', {
  connection: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
});

async function enqueueAll(
  userId: string,
  sourceType: MemoryIndexJob['sourceType'],
  ids: string[],
) {
  for (const sourceId of ids) {
    await queue.add('index', {
      userId,
      sourceType,
      sourceId,
      action: 'upsert',
    });
  }
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });

  for (const user of users) {
    const [tasks, projects, goals, reflections] = await Promise.all([
      prisma.task.findMany({ where: { userId: user.id }, select: { id: true } }),
      prisma.project.findMany({ where: { userId: user.id }, select: { id: true } }),
      prisma.goal.findMany({ where: { userId: user.id }, select: { id: true } }),
      prisma.reflection.findMany({ where: { userId: user.id }, select: { id: true } }),
    ]);

    await enqueueAll(user.id, 'TASK', tasks.map((t) => t.id));
    await enqueueAll(user.id, 'PROJECT', projects.map((p) => p.id));
    await enqueueAll(user.id, 'GOAL', goals.map((g) => g.id));
    await enqueueAll(user.id, 'REFLECTION', reflections.map((r) => r.id));

    console.log(
      `Queued for ${user.email}: ${tasks.length} tasks, ${projects.length} projects, ${goals.length} goals, ${reflections.length} reflections`,
    );
  }

  await queue.close();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

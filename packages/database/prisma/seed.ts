import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const LIFE_AREAS = [
  { slug: 'professional', label: 'Profissional', color: '#3B82F6', icon: '💼' },
  { slug: 'financial', label: 'Financeiro', color: '#10B981', icon: '💰' },
  { slug: 'family', label: 'Familiar', color: '#F59E0B', icon: '🏠' },
  { slug: 'health', label: 'Saúde', color: '#EF4444', icon: '❤️' },
  { slug: 'travel', label: 'Viagens', color: '#8B5CF6', icon: '✈️' },
];

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD ?? 'mika@dev2026', 10);

  const user = await prisma.user.upsert({
    where: { email: 'erik@mika.local' },
    update: {},
    create: {
      email: 'erik@mika.local',
      name: 'Erik',
      passwordHash,
      timezone: 'America/Sao_Paulo',
      preferences: {},
    },
  });

  console.log(`✅ User created: ${user.email}`);

  for (const area of LIFE_AREAS) {
    await prisma.lifeArea.upsert({
      where: { userId_slug: { userId: user.id, slug: area.slug } },
      update: {},
      create: {
        userId: user.id,
        slug: area.slug,
        label: area.label,
        color: area.color,
        icon: area.icon,
      },
    });
  }

  console.log(`✅ ${LIFE_AREAS.length} life areas seeded`);
  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

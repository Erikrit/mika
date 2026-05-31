import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LIFE_AREA_DEFAULTS } from '@mika/shared';

@Injectable()
export class LifeAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.lifeArea.findMany({
      where: { userId },
      orderBy: { slug: 'asc' },
    });
  }

  async seedForUser(userId: string) {
    const existing = await this.prisma.lifeArea.count({ where: { userId } });
    if (existing > 0) return;

    await this.prisma.lifeArea.createMany({
      data: LIFE_AREA_DEFAULTS.map((area) => ({
        userId,
        slug: area.slug,
        label: area.label,
        color: area.color,
        icon: area.icon,
      })),
      skipDuplicates: true,
    });
  }
}

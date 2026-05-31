import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGoalDto, UpdateGoalDto } from '@mika/shared';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        lifeAreaId: dto.lifeAreaId,
        title: dto.title,
        description: dto.description,
        horizon: dto.horizon.toUpperCase() as never,
        status: (dto.status ?? 'active').toUpperCase() as never,
        targetDate: dto.targetDate,
        progress: dto.progress,
      },
      include: { lifeArea: true },
    });
  }

  async findAll(userId: string, horizon?: string) {
    return this.prisma.goal.findMany({
      where: {
        userId,
        horizon: horizon?.toUpperCase() as never,
      },
      orderBy: [{ status: 'asc' }, { targetDate: 'asc' }],
      include: { lifeArea: true },
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: { lifeArea: true },
    });
    if (!goal) throw new NotFoundException('Objetivo não encontrado');

    const isOverdue =
      goal.targetDate &&
      goal.targetDate < new Date() &&
      goal.progress < 100 &&
      goal.status === 'ACTIVE';

    return { ...goal, isOverdue: !!isOverdue };
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    await this.findOne(userId, id);
    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        horizon: dto.horizon?.toUpperCase() as never,
        status: dto.status?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.goal.delete({ where: { id } });
  }
}

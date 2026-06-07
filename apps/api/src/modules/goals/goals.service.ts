import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryQueueService } from '../memory/memory-queue.service';
import type { CreateGoalDto, UpdateGoalDto } from '@mika/shared';

@Injectable()
export class GoalsService {
  constructor(
    @InjectPinoLogger(GoalsService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly memoryQueue: MemoryQueueService,
  ) {}

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
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
    this.enqueueGoalMemory(userId, goal.id);
    return goal;
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
    const goal = await this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        horizon: dto.horizon?.toUpperCase() as never,
        status: dto.status?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
    this.enqueueGoalMemory(userId, id);
    return goal;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.goal.delete({ where: { id } });
    this.enqueueGoalMemoryDelete(userId, id);
  }

  private enqueueGoalMemory(userId: string, goalId: string) {
    void this.memoryQueue.enqueueUpsert(userId, 'GOAL', goalId).catch((err) => {
      this.logger.warn({ err, goalId }, 'Falha ao enfileirar indexação de objetivo');
    });
  }

  private enqueueGoalMemoryDelete(userId: string, goalId: string) {
    void this.memoryQueue.enqueueDelete(userId, 'GOAL', goalId).catch((err) => {
      this.logger.warn({ err, goalId }, 'Falha ao enfileirar remoção de objetivo da memória');
    });
  }
}

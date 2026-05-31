import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTaskDto, UpdateTaskDto, TaskFilters } from '@mika/shared';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        lifeAreaId: dto.lifeAreaId,
        parentTaskId: dto.parentTaskId,
        priority: dto.priority,
        dueAt: dto.dueAt,
        energyLevel: dto.energyLevel?.toUpperCase() as never,
        contextTags: dto.contextTags,
      },
      include: { lifeArea: true, project: { select: { id: true, title: true } } },
    });
  }

  async findAll(userId: string, filters: TaskFilters) {
    return this.prisma.task.findMany({
      where: {
        userId,
        status: filters.status?.toUpperCase() as never,
        priority: filters.priority,
        lifeAreaId: filters.lifeAreaId,
        projectId: filters.projectId,
        dueAt: {
          gte: filters.dueFrom,
          lte: filters.dueTo,
        },
      },
      orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
      include: { lifeArea: true, project: { select: { id: true, title: true } } },
    });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        lifeArea: true,
        project: { select: { id: true, title: true } },
        subtasks: true,
      },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status?.toUpperCase() as never,
        energyLevel: dto.energyLevel?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
  }

  async complete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: { status: 'DONE', completedAt: new Date() },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.task.delete({ where: { id } });
  }

  async getTodayTasks(userId: string, timezone: string = 'America/Sao_Paulo') {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.task.findMany({
      where: {
        userId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        OR: [
          { dueAt: { gte: startOfDay, lte: endOfDay } },
          { dueAt: null, priority: { lte: 2 } },
        ],
      },
      orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }],
      include: { lifeArea: true },
    });
  }

  async getOverdueCount(userId: string) {
    const now = new Date();
    return this.prisma.task.count({
      where: {
        userId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueAt: { lt: now },
      },
    });
  }
}

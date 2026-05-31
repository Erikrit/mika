import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryQueueService } from '../memory/memory-queue.service';
import type { CreateProjectDto, UpdateProjectDto } from '@mika/shared';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly memoryQueue: MemoryQueueService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        userId,
        lifeAreaId: dto.lifeAreaId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status?.toUpperCase() as never,
        startDate: dto.startDate,
        targetDate: dto.targetDate,
        tags: dto.tags,
      },
      include: { lifeArea: true },
    });
    await this.memoryQueue.enqueueUpsert(userId, 'PROJECT', project.id);
    return project;
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      include: {
        lifeArea: true,
        _count: { select: { tasks: true } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        lifeArea: true,
        tasks: { orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }] },
      },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { ...project, taskCount: totalTasks, completionPercentage };
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(userId, id);
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
    await this.memoryQueue.enqueueUpsert(userId, 'PROJECT', id);
    return project;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    await this.memoryQueue.enqueueDelete(userId, 'PROJECT', id);
  }
}

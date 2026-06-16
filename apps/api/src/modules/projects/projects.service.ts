import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryQueueService } from '../memory/memory-queue.service';
import { TasksService } from '../tasks/tasks.service';
import type {
  CreateProjectDto,
  CreateProjectFromDraftDto,
  UpdateProjectDto,
} from '@mika/shared';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectPinoLogger(ProjectsService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly memoryQueue: MemoryQueueService,
    private readonly tasksService: TasksService,
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
    this.enqueueProjectMemory(userId, project.id);
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
    this.enqueueProjectMemory(userId, id);
    return project;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    this.enqueueProjectMemoryDelete(userId, id);
  }

  async createFromDraft(userId: string, dto: CreateProjectFromDraftDto) {
    const project = await this.create(userId, dto.project);
    const tasks = [];

    for (const task of dto.tasks) {
      tasks.push(
        await this.tasksService.create(userId, {
          ...task,
          projectId: project.id,
          lifeAreaId: task.lifeAreaId ?? project.lifeAreaId,
        }),
      );
    }

    return { project, tasks };
  }

  async getActiveSummary(userId: string, limit = 5) {
    const projects = await this.prisma.project.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      take: limit,
      orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
      include: {
        lifeArea: true,
        tasks: {
          select: { id: true, status: true },
        },
      },
    });

    return projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((task) => task.status === 'DONE').length;
      const completionPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        tasks: undefined,
        taskCount: totalTasks,
        completionPercentage,
      };
    });
  }

  private enqueueProjectMemory(userId: string, projectId: string) {
    void this.memoryQueue.enqueueUpsert(userId, 'PROJECT', projectId).catch((err) => {
      this.logger.warn({ err, projectId }, 'Falha ao enfileirar indexação de projeto');
    });
  }

  private enqueueProjectMemoryDelete(userId: string, projectId: string) {
    void this.memoryQueue.enqueueDelete(userId, 'PROJECT', projectId).catch((err) => {
      this.logger.warn({ err, projectId }, 'Falha ao enfileirar remoção de projeto da memória');
    });
  }
}

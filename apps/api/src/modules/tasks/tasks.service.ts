import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryQueueService } from '../memory/memory-queue.service';
import { ReminderSchedulerService } from '../reminders/reminder-scheduler.service';
import type { CreateTaskDto, UpdateTaskDto, TaskFilters } from '@mika/shared';

@Injectable()
export class TasksService {
  constructor(
    @InjectPinoLogger(TasksService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly memoryQueue: MemoryQueueService,
    private readonly reminders: ReminderSchedulerService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
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
    this.enqueueTaskMemory(userId, task.id);
    this.syncTaskReminderAsync(
      userId,
      task.id,
      task.title,
      task.dueAt,
      task.status,
    );
    return task;
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
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status?.toUpperCase() as never,
        energyLevel: dto.energyLevel?.toUpperCase() as never,
        neglectedSince: null,
      },
      include: { lifeArea: true },
    });
    this.enqueueTaskMemory(userId, id);
    this.syncTaskReminderAsync(
      userId,
      task.id,
      task.title,
      task.dueAt,
      task.status,
    );
    return task;
  }

  async complete(userId: string, id: string) {
    await this.findOne(userId, id);
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: 'DONE', completedAt: new Date(), neglectedSince: null },
    });
    this.enqueueTaskMemory(userId, id);
    this.cancelTaskRemindersAsync(userId, id);
    return task;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    this.cancelTaskRemindersAsync(userId, id);
    await this.prisma.task.delete({ where: { id } });
    this.enqueueTaskMemoryDelete(userId, id);
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

  private enqueueTaskMemory(userId: string, taskId: string) {
    void this.memoryQueue.enqueueUpsert(userId, 'TASK', taskId).catch((err) => {
      this.logger.warn({ err, taskId }, 'Falha ao enfileirar indexação de tarefa');
    });
  }

  private enqueueTaskMemoryDelete(userId: string, taskId: string) {
    void this.memoryQueue.enqueueDelete(userId, 'TASK', taskId).catch((err) => {
      this.logger.warn({ err, taskId }, 'Falha ao enfileirar remoção de tarefa da memória');
    });
  }

  private syncTaskReminderAsync(
    userId: string,
    taskId: string,
    title: string,
    dueAt: Date | null,
    status: string,
  ) {
    void this.reminders
      .syncTaskReminder(userId, taskId, title, dueAt, status)
      .catch((err) => {
        this.logger.warn({ err, taskId }, 'Falha ao enfileirar lembrete de tarefa');
      });
  }

  private cancelTaskRemindersAsync(userId: string, taskId: string) {
    void this.reminders.cancelEntityReminders(userId, 'TASK', taskId).catch((err) => {
      this.logger.warn({ err, taskId }, 'Falha ao cancelar lembretes de tarefa');
    });
  }
}

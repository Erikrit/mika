import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderQueueService } from './reminder-queue.service';
import {
  computeEventReminderAt,
  computeTaskReminderAt,
} from '@mika/shared';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: ReminderQueueService,
  ) {}

  async syncTaskReminder(
    userId: string,
    taskId: string,
    title: string,
    dueAt: Date | null | undefined,
    status: string,
  ): Promise<void> {
    await this.cancelEntityReminders(userId, 'TASK', taskId);

    if (!this.remindersEnabled()) return;

    if (!dueAt || status === 'DONE' || status === 'CANCELLED') return;

    const scheduledAt = computeTaskReminderAt(dueAt);
    if (!scheduledAt) return;

    const message = `⏰ Lembrete: tarefa "${title}" vence ${dueAt.toLocaleString('pt-BR')}`;
    await this.createAndEnqueue(userId, 'TASK', taskId, message, scheduledAt);
  }

  async syncEventReminder(
    userId: string,
    eventId: string,
    title: string,
    startsAt: Date,
    location?: string | null,
  ): Promise<void> {
    await this.cancelEntityReminders(userId, 'EVENT', eventId);

    if (!this.remindersEnabled()) return;

    const scheduledAt = computeEventReminderAt(startsAt);
    if (!scheduledAt) return;

    const time = startsAt.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
    const loc = location ? `\n📍 ${location}` : '';
    const message = `📆 Lembrete: "${title}" às ${time}${loc}`;
    await this.createAndEnqueue(userId, 'EVENT', eventId, message, scheduledAt);
  }

  async cancelEntityReminders(
    userId: string,
    entityType: 'TASK' | 'EVENT' | 'GOAL',
    entityId: string,
  ): Promise<void> {
    const pending = await this.prisma.reminder.findMany({
      where: {
        userId,
        entityType,
        entityId,
        status: 'PENDING',
      },
    });

    for (const r of pending) {
      await this.queue.cancelDispatch(r.id);
    }

    await this.prisma.reminder.updateMany({
      where: {
        userId,
        entityType,
        entityId,
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });
  }

  async scheduleNeglectedGoalReminder(
    userId: string,
    goalId: string,
    title: string,
  ): Promise<void> {
    if (!this.remindersEnabled()) return;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentAlert = await this.prisma.reminder.findFirst({
      where: {
        userId,
        entityType: 'GOAL',
        entityId: goalId,
        status: 'SENT',
        createdAt: { gte: weekAgo },
      },
    });
    if (recentAlert) return;

    const message = `⚠️ Objetivo negligenciado: "${title}"\nQuer retomar ou arquivar?`;
    const scheduledAt = new Date(Date.now() + 5_000);
    await this.createAndEnqueue(userId, 'GOAL', goalId, message, scheduledAt);
  }

  private async createAndEnqueue(
    userId: string,
    entityType: 'TASK' | 'EVENT' | 'GOAL',
    entityId: string,
    message: string,
    scheduledAt: Date,
  ): Promise<void> {
    const reminder = await this.prisma.reminder.create({
      data: {
        userId,
        entityType,
        entityId,
        message,
        scheduledAt,
        channel: 'TELEGRAM',
        status: 'PENDING',
      },
    });

    await this.queue.enqueueDispatch(reminder.id, userId, scheduledAt);
  }

  private remindersEnabled(): boolean {
    return process.env.MIKA_REMINDERS_ENABLED === 'true';
  }
}

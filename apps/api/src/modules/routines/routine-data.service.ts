import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import type {
  DailySummaryData,
  WeeklyReviewData,
  MiddayCheckData,
  EveningReflectionData,
} from '@mika/ai';

@Injectable()
export class RoutineDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async getDailySummaryData(userId: string, timezone = 'America/Sao_Paulo'): Promise<DailySummaryData> {
    const now = new Date();
    const { startOfDay, endOfDay } = this.getDayBounds(now, timezone);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [todayTasks, overdueTasks, events, neglectedGoals] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          OR: [
            { dueAt: { gte: startOfDay, lte: endOfDay } },
            { dueAt: null, priority: { lte: 2 } },
            { dueAt: { lt: startOfDay } },
          ],
        },
        orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }],
        take: 10,
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueAt: { lt: startOfDay },
        },
        orderBy: [{ dueAt: 'asc' }, { priority: 'asc' }],
      }),
      this.prisma.event.findMany({
        where: {
          userId,
          startsAt: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.goal.findMany({
        where: {
          userId,
          status: 'ACTIVE',
          updatedAt: { lt: sevenDaysAgo },
        },
        orderBy: { updatedAt: 'asc' },
        take: 5,
      }),
    ]);

    const overdueItems = overdueTasks.map((t) => this.toTaskItem(t, startOfDay, true));
    const topTasks = todayTasks
      .slice(0, 3)
      .map((t) => this.toTaskItem(t, startOfDay, t.dueAt ? t.dueAt < startOfDay : false));

    return {
      date: now.toLocaleDateString('pt-BR', { timeZone: timezone }),
      topTasks,
      events: events.map((e) => ({
        title: e.title,
        startsAt: e.startsAt,
        isAllDay: e.isAllDay,
        location: e.location,
      })),
      overdueTasks: overdueItems,
      neglectedGoals: neglectedGoals.map((g) => ({
        title: g.title,
        type: 'goal' as const,
        daysSinceUpdate: this.daysBetween(g.updatedAt, now),
      })),
    };
  }

  async getWeeklyReviewData(userId: string, timezone = 'America/Sao_Paulo'): Promise<WeeklyReviewData> {
    const now = new Date();
    const { weekStart, weekEnd } = this.getWeekBounds(now, timezone);
    const nextWeekStart = new Date(weekEnd);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    nextWeekStart.setHours(0, 0, 0, 0);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    nextWeekEnd.setHours(23, 59, 59, 999);

    const [completedTasks, overdueTasks, neglectedTasks, neglectedGoals, nextWeekEvents] =
      await Promise.all([
        this.prisma.task.findMany({
          where: {
            userId,
            status: 'DONE',
            completedAt: { gte: weekStart, lte: weekEnd },
          },
          orderBy: { completedAt: 'desc' },
        }),
        this.prisma.task.findMany({
          where: {
            userId,
            status: { in: ['TODO', 'IN_PROGRESS'] },
            dueAt: { lt: now },
          },
          orderBy: { dueAt: 'asc' },
        }),
        this.prisma.task.findMany({
          where: {
            userId,
            status: { in: ['TODO', 'IN_PROGRESS'] },
            neglectedSince: { not: null },
          },
          orderBy: { neglectedSince: 'asc' },
        }),
        this.prisma.goal.findMany({
          where: {
            userId,
            status: 'ACTIVE',
            updatedAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { updatedAt: 'asc' },
        }),
        this.prisma.event.findMany({
          where: {
            userId,
            startsAt: { gte: nextWeekStart, lte: nextWeekEnd },
          },
          orderBy: { startsAt: 'asc' },
          take: 10,
        }),
      ]);

    const neglectedItems = [
      ...neglectedTasks.map((t) => ({
        title: t.title,
        type: 'task' as const,
        daysSinceUpdate: this.daysBetween(t.updatedAt, now),
      })),
      ...neglectedGoals.map((g) => ({
        title: g.title,
        type: 'goal' as const,
        daysSinceUpdate: this.daysBetween(g.updatedAt, now),
      })),
    ];

    return {
      weekStart: weekStart.toLocaleDateString('pt-BR', { timeZone: timezone }),
      weekEnd: weekEnd.toLocaleDateString('pt-BR', { timeZone: timezone }),
      completedTasks: completedTasks.map((t) => ({
        title: t.title,
        completedAt: t.completedAt!,
      })),
      overdueTasks: overdueTasks.map((t) => this.toTaskItem(t, now, true)),
      neglectedItems,
      nextWeekEvents: nextWeekEvents.map((e) => ({
        title: e.title,
        startsAt: e.startsAt,
        isAllDay: e.isAllDay,
        location: e.location,
      })),
      completedCount: completedTasks.length,
    };
  }

  async getMiddayCheckData(userId: string, timezone = 'America/Sao_Paulo'): Promise<MiddayCheckData> {
    const now = new Date();
    const { startOfDay, endOfDay } = this.getDayBounds(now, timezone);
    const morningPriority = await this.getMorningPriorityToday(userId, startOfDay, endOfDay);

    const [pendingTasks, completedTodayCount] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          OR: [
            { dueAt: { gte: startOfDay, lte: endOfDay } },
            { dueAt: { lt: startOfDay } },
            { dueAt: null, priority: { lte: 3 } },
          ],
        },
        orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }],
        take: 8,
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'DONE',
          completedAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    return {
      date: now.toLocaleDateString('pt-BR', { timeZone: timezone }),
      pendingTasks: pendingTasks.map((t) => this.toTaskItem(t, startOfDay, t.dueAt ? t.dueAt < startOfDay : false)),
      morningPriority,
      completedTodayCount,
    };
  }

  async getEveningReflectionData(
    userId: string,
    timezone = 'America/Sao_Paulo',
  ): Promise<EveningReflectionData> {
    const now = new Date();
    const { startOfDay, endOfDay } = this.getDayBounds(now, timezone);

    const [completedTasks, pendingTasks, eventsToday] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          status: 'DONE',
          completedAt: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          OR: [
            { dueAt: { gte: startOfDay, lte: endOfDay } },
            { dueAt: { lt: startOfDay } },
          ],
        },
        orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }],
        take: 5,
      }),
      this.prisma.event.findMany({
        where: {
          userId,
          startsAt: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startsAt: 'asc' },
      }),
    ]);

    return {
      date: now.toLocaleDateString('pt-BR', { timeZone: timezone }),
      completedTasks: completedTasks.map((t) => ({ title: t.title })),
      pendingTasks: pendingTasks.map((t) => this.toTaskItem(t, startOfDay, t.dueAt ? t.dueAt < startOfDay : false)),
      eventsToday: eventsToday.map((e) => ({
        title: e.title,
        startsAt: e.startsAt,
        isAllDay: e.isAllDay,
        location: e.location,
      })),
    };
  }

  async markNeglectedTasks(userId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.prisma.task.updateMany({
      where: {
        userId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        updatedAt: { lt: sevenDaysAgo },
        neglectedSince: null,
      },
      data: { neglectedSince: new Date() },
    });

    return result.count;
  }

  private async getMorningPriorityToday(
    userId: string,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<string | null> {
    const reflection = await this.prisma.reflection.findFirst({
      where: {
        userId,
        routineType: 'MORNING',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!reflection) return null;

    try {
      return this.encryption.decrypt(reflection.content);
    } catch {
      return null;
    }
  }

  private toTaskItem(
    task: { title: string; priority: number; dueAt: Date | null },
    reference: Date,
    overdue: boolean,
  ) {
    const daysOverdue =
      overdue && task.dueAt ? this.daysBetween(task.dueAt, reference) : undefined;

    return {
      title: task.title,
      priority: task.priority,
      dueAt: task.dueAt,
      overdue,
      daysOverdue,
    };
  }

  private daysBetween(from: Date, to: Date): number {
    return Math.max(0, Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
  }

  private getDayBounds(now: Date, _timezone: string) {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
  }

  private getWeekBounds(now: Date, _timezone: string) {
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }
}

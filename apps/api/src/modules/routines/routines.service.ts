import { Injectable, NotFoundException } from '@nestjs/common';
import { RoutineRunType } from '@mika/database';
import { generateRoutine, type RoutineType } from '@mika/ai';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { RoutineDataService } from './routine-data.service';

type PendingRoutineKind = 'morning' | 'midday' | 'evening';

type UserPreferences = {
  pendingRoutine?: {
    type: PendingRoutineKind;
    routineRunId: string;
    expiresAt: string;
  };
};

@Injectable()
export class RoutinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly data: RoutineDataService,
    private readonly telegram: TelegramService,
  ) {}

  async resolveUserId(userId?: string): Promise<{ userId: string; timezone: string }> {
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
      return { userId: user.id, timezone: user.timezone };
    }

    const user =
      (await this.prisma.user.findFirst({
        where: { telegramChatId: { not: null } },
        orderBy: { createdAt: 'asc' },
      })) ??
      (await this.prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }));

    if (!user) throw new NotFoundException('Nenhum usuário encontrado');
    return { userId: user.id, timezone: user.timezone };
  }

  async runDailySummary(userId?: string) {
    const { userId: uid, timezone } = await this.resolveUserId(userId);
    const summaryData = await this.data.getDailySummaryData(uid, timezone);
    const result = await generateRoutine('DAILY_SUMMARY', summaryData);

    let content = result.content;
    if (!content.includes('Qual sua prioridade principal hoje')) {
      content = `${content.trim()}\n\nQual sua prioridade principal hoje?`;
    }

    return this.deliverRoutine(uid, 'DAILY_SUMMARY', content, result.status, {
      tasksCount: summaryData.topTasks.length,
      overdueCount: summaryData.overdueTasks.length,
      eventsCount: summaryData.events.length,
      latencyMs: result.latencyMs,
    }, 'morning');
  }

  async runWeeklyReview(userId?: string) {
    const { userId: uid, timezone } = await this.resolveUserId(userId);
    await this.data.markNeglectedTasks(uid);

    const reviewData = await this.data.getWeeklyReviewData(uid, timezone);
    const result = await generateRoutine('WEEKLY_REVIEW', reviewData);

    return this.deliverRoutine(uid, 'WEEKLY_REVIEW', result.content, result.status, {
      completedCount: reviewData.completedCount,
      overdueCount: reviewData.overdueTasks.length,
      neglectedCount: reviewData.neglectedItems.length,
      latencyMs: result.latencyMs,
    });
  }

  async runMiddayCheck(userId?: string) {
    const { userId: uid, timezone } = await this.resolveUserId(userId);
    const middayData = await this.data.getMiddayCheckData(uid, timezone);
    const result = await generateRoutine('MIDDAY_CHECK', middayData);

    let content = result.content;
    if (!content.includes('Como está o progresso até agora')) {
      content = `${content.trim()}\n\nComo está o progresso até agora?`;
    }

    return this.deliverRoutine(uid, 'MIDDAY_CHECK', content, result.status, {
      pendingCount: middayData.pendingTasks.length,
      completedTodayCount: middayData.completedTodayCount,
      latencyMs: result.latencyMs,
    }, 'midday');
  }

  async runEveningReflection(userId?: string) {
    const { userId: uid, timezone } = await this.resolveUserId(userId);
    const eveningData = await this.data.getEveningReflectionData(uid, timezone);
    const result = await generateRoutine('EVENING_REFLECTION', eveningData);

    let content = result.content;
    if (!content.includes('Como foi seu dia')) {
      content = `${content.trim()}\n\nComo foi seu dia? O que aprendeu?`;
    }

    return this.deliverRoutine(uid, 'EVENING_REFLECTION', content, result.status, {
      completedCount: eveningData.completedTasks.length,
      pendingCount: eveningData.pendingTasks.length,
      latencyMs: result.latencyMs,
    }, 'evening');
  }

  async getLatest(userId: string, type: RoutineRunType) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const isDailyType =
      type === 'DAILY_SUMMARY' || type === 'MIDDAY_CHECK' || type === 'EVENING_REFLECTION';

    const run = await this.prisma.routineRun.findFirst({
      where: {
        userId,
        type,
        ...(isDailyType ? { createdAt: { gte: startOfDay } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return run;
  }

  private async deliverRoutine(
    userId: string,
    type: RoutineType,
    content: string,
    status: 'success' | 'fallback',
    metadata: Record<string, unknown>,
    pendingType?: PendingRoutineKind,
  ) {
    const run = await this.prisma.routineRun.create({
      data: {
        userId,
        type: type as RoutineRunType,
        content,
        metadata: { ...metadata, status },
        channel: 'TELEGRAM',
      },
    });

    const delivered = await this.telegram.sendToUser(userId, content);

    if (delivered) {
      await this.prisma.routineRun.update({
        where: { id: run.id },
        data: { deliveredAt: new Date() },
      });
    }

    if (pendingType) {
      await this.setPendingRoutine(userId, pendingType, run.id);
    }

    return {
      routineRunId: run.id,
      delivered,
      status,
    };
  }

  private async setPendingRoutine(
    userId: string,
    type: PendingRoutineKind,
    routineRunId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const prefs = (user.preferences ?? {}) as UserPreferences;
    prefs.pendingRoutine = {
      type,
      routineRunId,
      expiresAt: this.getPendingExpiry(type).toISOString(),
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs as object },
    });
  }

  private getPendingExpiry(type: PendingRoutineKind): Date {
    const now = new Date();
    const expiry = new Date(now);

    if (type === 'morning') {
      expiry.setHours(10, 0, 0, 0);
      if (expiry <= now) expiry.setHours(23, 59, 59, 999);
    } else {
      expiry.setHours(23, 59, 59, 999);
    }

    return expiry;
  }
}

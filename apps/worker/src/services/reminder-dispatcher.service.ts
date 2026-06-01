import type { PrismaClient } from '@mika/database';
import pino from 'pino';
import { applyDndShift, formatReminderMinuteKey } from '@mika/shared';
import { sendTelegramMessage } from '../utils/telegram';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const MAX_RETRIES = 2;

export class ReminderDispatcherService {
  constructor(private readonly prisma: PrismaClient) {}

  async dispatch(reminderId: string): Promise<void> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id: reminderId },
      include: { user: { select: { id: true, telegramChatId: true, timezone: true } } },
    });

    if (!reminder || reminder.status !== 'PENDING') {
      logger.info({ reminderId }, 'reminder skipped (missing or not pending)');
      return;
    }

    const timezone = reminder.user.timezone ?? 'America/Sao_Paulo';
    const now = new Date();
    const effectiveAt = applyDndShift(reminder.scheduledAt, timezone);

    if (effectiveAt.getTime() > now.getTime() + 60_000) {
      logger.info(
        { reminderId, effectiveAt },
        'reminder deferred by DND — re-enqueue skipped (handled at schedule)',
      );
    }

    const minuteKey = formatReminderMinuteKey(now);
    const batch = await this.prisma.reminder.findMany({
      where: {
        userId: reminder.userId,
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(now.getTime() + 60_000),
          gte: new Date(now.getTime() - 60_000),
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const sameMinute = batch.filter(
      (r) => formatReminderMinuteKey(r.scheduledAt) === minuteKey || r.id === reminderId,
    );

    const toSend = sameMinute.length > 0 ? sameMinute : [reminder];
    const combinedMessage =
      toSend.length > 1
        ? toSend.map((r) => r.message).join('\n\n')
        : reminder.message;

    const chatId = reminder.user.telegramChatId;
    if (!chatId) {
      await this.markFailed(toSend, 'telegram', 'Usuário sem Telegram vinculado');
      return;
    }

    let lastError: string | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await sendTelegramMessage(chatId, combinedMessage);
        await this.markSent(toSend, 'telegram');
        logger.info({ reminderId, batchSize: toSend.length }, 'reminder delivered');
        return;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        logger.warn({ reminderId, attempt, err: lastError }, 'reminder delivery failed');
      }
    }

    await this.markFailed(toSend, 'telegram', lastError ?? 'unknown error');
  }

  async processNeglectedGoals(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const goals = await this.prisma.goal.findMany({
      where: {
        status: 'ACTIVE',
        updatedAt: { lt: sevenDaysAgo },
      },
      select: { id: true, userId: true, title: true },
    });

    for (const goal of goals) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentAlert = await this.prisma.reminder.findFirst({
        where: {
          userId: goal.userId,
          entityType: 'GOAL',
          entityId: goal.id,
          status: 'SENT',
          createdAt: { gte: weekAgo },
        },
      });
      if (recentAlert) continue;

      const message = `⚠️ Objetivo negligenciado: "${goal.title}"\nQuer retomar ou arquivar?`;
      const scheduledAt = new Date(Date.now() + 5_000);

      const created = await this.prisma.reminder.create({
        data: {
          userId: goal.userId,
          entityType: 'GOAL',
          entityId: goal.id,
          message,
          scheduledAt,
          channel: 'TELEGRAM',
          status: 'PENDING',
        },
      });

      await this.dispatch(created.id);
    }
  }

  private async markSent(
    reminders: Array<{ id: string }>,
    channel: string,
  ): Promise<void> {
    for (const r of reminders) {
      await this.prisma.reminder.update({
        where: { id: r.id },
        data: { status: 'SENT' },
      });
      await this.prisma.notificationLog.create({
        data: { reminderId: r.id, channel, status: 'sent' },
      });
    }
  }

  private async markFailed(
    reminders: Array<{ id: string }>,
    channel: string,
    error: string,
  ): Promise<void> {
    for (const r of reminders) {
      await this.prisma.reminder.update({
        where: { id: r.id },
        data: { status: 'FAILED' },
      });
      await this.prisma.notificationLog.create({
        data: { reminderId: r.id, channel, status: 'failed', error },
      });
    }
  }
}

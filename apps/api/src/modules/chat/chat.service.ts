import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { generateReply } from '@mika/ai';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { TasksService } from '../tasks/tasks.service';
import type { ChatChannel } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    @InjectPinoLogger(ChatService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardService,
    private readonly tasks: TasksService,
  ) {}

  async sendMessage(
    userId: string,
    message: string,
    channel: ChatChannel,
    sessionId?: string,
  ) {
    const session = await this.getOrCreateSession(userId, channel, sessionId);

    const history = await this.prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const context = await this.buildContext(userId);

    const result = await generateReply({
      userId,
      channel: channel === 'TELEGRAM' ? 'telegram' : 'web',
      context,
      history: history
        .reverse()
        .filter((m) => m.role === 'USER' || m.role === 'ASSISTANT')
        .map((m) => ({
          role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        })),
      message,
    });

    this.logger.info(
      { userId, channel, latencyMs: result.latencyMs, status: result.status },
      'chat reply generated',
    );

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: { sessionId: session.id, role: 'USER', content: message },
      }),
      this.prisma.chatMessage.create({
        data: { sessionId: session.id, role: 'ASSISTANT', content: result.reply },
      }),
      this.prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: now },
      }),
    ]);

    return { sessionId: session.id, reply: result.reply, createdAt: now.toISOString() };
  }

  private async getOrCreateSession(
    userId: string,
    channel: ChatChannel,
    sessionId?: string,
  ) {
    if (sessionId) {
      const existing = await this.prisma.chatSession.findFirst({
        where: { id: sessionId, userId, channel },
      });
      if (!existing) throw new NotFoundException('Sessão não encontrada');
      return existing;
    }

    return this.prisma.chatSession.create({
      data: { userId, channel },
    });
  }

  private async buildContext(userId: string): Promise<string> {
    const [today, pendingTasks] = await Promise.all([
      this.dashboard.getToday(userId),
      this.tasks.findAll(userId, { status: 'todo' }),
    ]);

    const topTasks = pendingTasks.slice(0, 10);
    const lines: string[] = [];

    lines.push(`Data: ${new Date().toLocaleDateString('pt-BR')}`);
    lines.push(`Tarefas atrasadas: ${today.overdueTasks}`);

    if (today.events.length > 0) {
      lines.push('\nCompromissos de hoje:');
      for (const e of today.events) {
        const time = e.isAllDay
          ? 'dia todo'
          : e.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        lines.push(`- ${time}: ${e.title}`);
      }
    } else {
      lines.push('\nNenhum compromisso hoje.');
    }

    if (today.tasks.length > 0) {
      lines.push('\nTarefas de hoje:');
      for (const t of today.tasks) {
        lines.push(`- [P${t.priority}] ${t.title}`);
      }
    }

    if (topTasks.length > 0) {
      lines.push('\nTop tarefas pendentes por prioridade:');
      for (const t of topTasks) {
        const due = t.dueAt
          ? ` (vence ${t.dueAt.toLocaleDateString('pt-BR')})`
          : '';
        lines.push(`- [P${t.priority}] ${t.title}${due}`);
      }
    }

    return lines.join('\n');
  }
}

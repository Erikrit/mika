import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  generateReplyWithTools,
  streamReplyWithTools,
  summarizeOlderMessages,
} from '@mika/ai';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryService } from '../memory/memory.service';
import { ChatToolExecutorService } from './chat-tool-executor.service';
import type { ChatChannel } from '@prisma/client';
import type { Response } from 'express';

const RECENT_HISTORY = 5;
const SUMMARIZE_THRESHOLD = 20;

@Injectable()
export class ChatService {
  constructor(
    @InjectPinoLogger(ChatService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly memory: MemoryService,
    private readonly toolExecutor: ChatToolExecutorService,
  ) {}

  async sendMessage(
    userId: string,
    message: string,
    channel: ChatChannel,
    sessionId?: string,
  ) {
    const session = await this.getOrCreateSession(userId, channel, sessionId);
    const history = await this.prepareHistory(session.id);
    const context = await this.buildLightContext(userId);
    const executors = this.toolExecutor.createExecutors(userId, channel);

    const result = await generateReplyWithTools({
      channel: channel === 'TELEGRAM' ? 'telegram' : 'web',
      context,
      history,
      message,
      executors,
    });

    this.logger.info(
      { userId, channel, latencyMs: result.latencyMs, status: result.status },
      'chat reply generated',
    );

    const now = new Date();
    await this.persistExchange(session.id, message, result.reply, now);

    return { sessionId: session.id, reply: result.reply, createdAt: now.toISOString() };
  }

  async streamMessage(
    userId: string,
    message: string,
    res: Response,
    sessionId?: string,
  ): Promise<void> {
    const session = await this.getOrCreateSession(userId, 'WEB', sessionId);
    const history = await this.prepareHistory(session.id);
    const context = await this.buildLightContext(userId);
    const executors = this.toolExecutor.createExecutors(userId, 'WEB');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const stream = streamReplyWithTools({
      channel: 'web',
      context,
      history,
      message,
      executors,
    });

    let fullReply = '';

    try {
      for await (const chunk of stream.textStream) {
        fullReply += chunk;
        res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
      }

      const now = new Date();
      await this.persistExchange(session.id, message, fullReply, now);

      res.write(
        `data: ${JSON.stringify({
          done: true,
          sessionId: session.id,
          reply: fullReply,
          createdAt: now.toISOString(),
        })}\n\n`,
      );
    } catch (err) {
      this.logger.error({ userId, err }, 'chat stream error');
      res.write(
        `data: ${JSON.stringify({
          error: 'Estou com dificuldade agora, tente em alguns minutos',
        })}\n\n`,
      );
    } finally {
      res.end();
    }
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

  private async prepareHistory(sessionId: string) {
    const all = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    const conversational = all.filter(
      (m) => m.role === 'USER' || m.role === 'ASSISTANT',
    );

    if (conversational.length <= SUMMARIZE_THRESHOLD) {
      return conversational.slice(-RECENT_HISTORY).map((m) => ({
        role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));
    }

    const older = conversational.slice(0, -RECENT_HISTORY);
    const recent = conversational.slice(-RECENT_HISTORY);

    const summary = await summarizeOlderMessages(
      older.map((m) => ({
        role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
    );

    return [
      {
        role: 'assistant' as const,
        content: `[Resumo da conversa anterior]: ${summary}`,
      },
      ...recent.map((m) => ({
        role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
    ];
  }

  private async buildLightContext(userId: string): Promise<string> {
    const fixedProfile = await this.memory.getFixedProfileContext(userId);
    const lines = [`Data: ${new Date().toLocaleDateString('pt-BR')}`];
    if (fixedProfile) {
      lines.push('\n--- Perfil fixo ---');
      lines.push(fixedProfile);
    }
    return lines.join('\n');
  }

  async listWebSessions(userId: string, limit: number) {
    const sessions = await this.prisma.chatSession.findMany({
      where: { userId, channel: 'WEB' },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        messages: {
          where: { role: { in: ['USER', 'ASSISTANT'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true },
        },
        _count: { select: { messages: true } },
      },
    });

    return sessions.map((s) => {
      const previewRaw = s.messages[0]?.content;
      const preview =
        previewRaw != null
          ? previewRaw.length > 80
            ? `${previewRaw.slice(0, 80)}…`
            : previewRaw
          : null;

      return {
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt.toISOString(),
        preview,
        messageCount: s._count.messages,
      };
    });
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada');

    const messages = await this.prisma.chatMessage.findMany({
      where: { sessionId, role: { in: ['USER', 'ASSISTANT'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return messages.map((m) => ({
      id: m.id,
      role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  private async persistExchange(
    sessionId: string,
    userMessage: string,
    assistantReply: string,
    now: Date,
  ) {
    await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: { sessionId, role: 'USER', content: userMessage },
      }),
      this.prisma.chatMessage.create({
        data: { sessionId, role: 'ASSISTANT', content: assistantReply },
      }),
      this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: now },
      }),
    ]);
  }
}

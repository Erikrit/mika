import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TasksService } from '../tasks/tasks.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ChatService } from '../chat/chat.service';
import { AuthService } from '../auth/auth.service';
import { ReflectionsService } from '../reflections/reflections.service';
import { PrismaService } from '../prisma/prisma.service';

const TELEGRAM_MAX_LENGTH = 4096;
const TELEGRAM_INIT_TIMEOUT_MS = 8_000;

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

type PendingRoutineKind = 'morning' | 'midday' | 'evening';

type UserPreferences = {
  pendingRoutine?: {
    type: PendingRoutineKind;
    routineRunId: string;
    expiresAt: string;
  };
};

const ROUTINE_TYPE_MAP: Record<PendingRoutineKind, 'morning' | 'midday' | 'evening'> = {
  morning: 'morning',
  midday: 'midday',
  evening: 'evening',
};
@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot<Context> | null = null;

  constructor(
    @InjectPinoLogger(TelegramService.name) private readonly logger: PinoLogger,
    private readonly tasks: TasksService,
    private readonly dashboard: DashboardService,
    private readonly chat: ChatService,
    private readonly auth: AuthService,
    private readonly reflections: ReflectionsService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const enabled =
      process.env.TELEGRAM_ENABLED !== 'false' &&
      process.env.MIKA_TELEGRAM_MODULE_ENABLED !== 'false';

    if (!enabled) {
      this.logger.warn('Telegram disabled by env, skipping bot initialization');
      return;
    }

    if (!token || token === 'your-bot-token-from-botfather') {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured, skipping bot initialization');
      return;
    }

    this.bot = new Bot(token);
    this.registerCommands();
    this.bot.catch((err) => {
      this.logger.error({ err }, 'telegram bot error');
    });

    try {
      if (process.env.NODE_ENV === 'production') {
        this.logger.info('Telegram bot configured for webhook mode');
      } else {
        await withTimeout(
          this.bot.api.deleteWebhook({ drop_pending_updates: true }),
          TELEGRAM_INIT_TIMEOUT_MS,
          'deleteWebhook',
        );
        void this.bot.start({
          onStart: () => this.logger.info('Telegram bot started in polling mode'),
        });
      }
    } catch (err) {
      this.logger.warn(
        { err },
        'Telegram bot unavailable (network or API error) — API will run without bot. Set TELEGRAM_ENABLED=false to silence this.',
      );
      this.bot = null;
    }
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop();
    }
  }

  private registerCommands() {
    if (!this.bot) return;

    this.bot.command('start', async (ctx) => {
      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) {
        await ctx.reply(
          '👋 Olá! Sou a Mika, sua assistente pessoal.\n\n' +
          'Para conectar sua conta:\n' +
          '1. Acesse o app web → Configurações\n' +
          '2. Gere um código de vinculação\n' +
          '3. Envie aqui: /vincular CODIGO',
        );
        return;
      }
      await ctx.reply(
        '✅ Conta conectada! Comandos disponíveis:\n\n' +
        '/hoje — tarefas e eventos de hoje\n' +
        '/prioridades — top 5 tarefas por prioridade\n' +
        '/tarefa [texto] — criar nova tarefa\n' +
        '/ajuda — ver todos os comandos\n\n' +
        '💬 Ou envie uma mensagem para conversar comigo!',
      );
    });

    this.bot.hears(/^\/vincular(?:@[\w_]+)?(?:\s*\d{6})?\s*$/i, async (ctx) => {
      await this.handleVincular(ctx);
    });

    this.bot.command('hoje', async (ctx) => {
      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) return ctx.reply('❌ Conta não vinculada. Use /start para instruções.');

      const data = await this.dashboard.getToday(userId);

      let msg = `📅 *Hoje — ${new Date().toLocaleDateString('pt-BR')}*\n\n`;

      if (data.events.length > 0) {
        msg += `📆 *Compromissos (${data.events.length})*\n`;
        for (const e of data.events) {
          const time = e.isAllDay ? 'dia todo' : e.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          msg += `• ${time} — ${e.title}\n`;
        }
        msg += '\n';
      }

      if (data.tasks.length > 0) {
        msg += `✅ *Tarefas (${data.tasks.length})*\n`;
        for (const t of data.tasks) {
          const priority = t.priority <= 2 ? '🔴' : t.priority === 3 ? '🟡' : '🟢';
          msg += `${priority} ${t.title}\n`;
        }
      } else {
        msg += '✨ Nenhuma tarefa para hoje!\n';
      }

      if (data.overdueTasks > 0) {
        msg += `\n⚠️ *${data.overdueTasks} tarefa(s) atrasada(s)*`;
      }

      await ctx.reply(msg, { parse_mode: 'Markdown' });
    });

    this.bot.command('tarefa', async (ctx) => {
      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) return ctx.reply('❌ Conta não vinculada. Use /start para instruções.');

      const text = ctx.message?.text?.replace('/tarefa', '').trim();
      if (!text) return ctx.reply('ℹ️ Use: /tarefa [texto da tarefa]');

      await this.tasks.create(userId, { title: text, priority: 3, contextTags: [] });
      await ctx.reply(`✅ Tarefa criada: *${text}*`, { parse_mode: 'Markdown' });
    });

    this.bot.command('prioridades', async (ctx) => {
      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) return ctx.reply('❌ Conta não vinculada. Use /start para instruções.');

      const tasks = await this.tasks.findAll(userId, { status: 'todo' });
      const top5 = tasks.slice(0, 5);

      if (top5.length === 0) return ctx.reply('✨ Nenhuma tarefa pendente!');

      let msg = `🎯 *Top ${top5.length} Prioridades*\n\n`;
      top5.forEach((t, i) => {
        const priority = t.priority <= 2 ? '🔴' : t.priority === 3 ? '🟡' : '🟢';
        msg += `${i + 1}. ${priority} ${t.title}\n`;
      });

      await ctx.reply(msg, { parse_mode: 'Markdown' });
    });

    this.bot.command('ajuda', async (ctx) => {
      await ctx.reply(
        '🤖 *Mika — Comandos*\n\n' +
        '/hoje — resumo do dia (tarefas + eventos)\n' +
        '/prioridades — top 5 tarefas prioritárias\n' +
        '/tarefa [texto] — criar nova tarefa\n' +
        '/vincular CODIGO — conectar conta web\n' +
        '/ajuda — esta mensagem\n\n' +
        '💬 Envie uma mensagem de texto para conversar comigo!',
        { parse_mode: 'Markdown' },
      );
    });

    this.bot.on('message:text', async (ctx) => {
      const text = ctx.message.text.trim();

      if (text.startsWith('/')) return;

      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) {
        if (/^\d{6}$/.test(text)) {
          await this.linkAccount(ctx, text);
          return;
        }
        await ctx.reply('❌ Conta não vinculada. Use /start para instruções de vinculação.');
        return;
      }

      await ctx.replyWithChatAction('typing');

      const pending = await this.getPendingRoutine(userId);
      if (pending && !this.isPendingExpired(pending.expiresAt)) {
        await this.handleRoutineResponse(userId, pending.type, text);
        await ctx.reply('✅ Anotado! Obrigada por compartilhar.');
        return;
      }

      try {
        const result = await this.chat.sendMessage(userId, text, 'TELEGRAM');
        const chunks = this.splitMessage(result.reply);
        for (const chunk of chunks) {
          await ctx.reply(chunk);
        }
      } catch (err) {
        this.logger.error({ userId, err }, 'telegram chat error');
        await ctx.reply('Estou com dificuldade agora, tente em alguns minutos');
      }
    });
  }

  private extractLinkCode(ctx: Context): string | null {
    const fromMatch = typeof ctx.match === 'string' ? ctx.match.trim() : '';
    if (/^\d{6}$/.test(fromMatch)) return fromMatch;

    const text = ctx.message?.text?.trim() ?? '';
    const match = text.match(/^\/vincular(?:@[\w_]+)?\s*(\d{6})\b/i);
    return match?.[1] ?? null;
  }

  private async handleVincular(ctx: Context) {
    const chatId = ctx.from?.id;
    if (!chatId) return;

    const existingUserId = await this.getUserId(chatId);
    if (existingUserId) {
      await ctx.reply('✅ Sua conta já está vinculada!');
      return;
    }

    const code = this.extractLinkCode(ctx);
    if (!code) {
      await ctx.reply('ℹ️ Use: /vincular CODIGO\n\nGere o código em Configurações no app web.');
      return;
    }

    await this.linkAccount(ctx, code);
  }

  private async linkAccount(ctx: Context, code: string) {
    const chatId = ctx.from?.id;
    if (!chatId) return;

    try {
      const result = await this.auth.linkTelegramByCode(code, String(chatId));
      await ctx.reply(`✅ Conta vinculada com sucesso, ${result.name}! Use /ajuda para ver os comandos.`);
    } catch (err) {
      this.logger.warn({ chatId, err }, 'telegram link failed');
      await ctx.reply('❌ Código inválido ou expirado. Gere um novo código no app web.');
    }
  }

  async sendToUser(userId: string, content: string): Promise<boolean> {
    if (!this.bot) return false;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.telegramChatId) return false;

    const chunks = this.splitMessage(content);
    for (const chunk of chunks) {
      await this.bot.api.sendMessage(user.telegramChatId, chunk);
    }
    return true;
  }

  private async getPendingRoutine(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const prefs = (user.preferences ?? {}) as UserPreferences;
    return prefs.pendingRoutine ?? null;
  }

  private isPendingExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  private async handleRoutineResponse(
    userId: string,
    type: PendingRoutineKind,
    content: string,
  ) {
    await this.reflections.create(userId, {
      content,
      routineType: ROUTINE_TYPE_MAP[type],
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const prefs = { ...(user.preferences as UserPreferences) };
    delete prefs.pendingRoutine;

    await this.prisma.user.update({
      where: { id: userId },
      data: { preferences: prefs as object },
    });
  }

  private splitMessage(text: string): string[] {
    if (text.length <= TELEGRAM_MAX_LENGTH) return [text];
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      chunks.push(remaining.slice(0, TELEGRAM_MAX_LENGTH));
      remaining = remaining.slice(TELEGRAM_MAX_LENGTH);
    }
    return chunks;
  }

  private async getUserId(telegramChatId?: number): Promise<string | null> {
    if (!telegramChatId) return null;
    const user = await this.prisma.user.findFirst({
      where: { telegramChatId: String(telegramChatId) },
    });
    return user?.id ?? null;
  }

  getBot() {
    return this.bot;
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TasksService } from '../tasks/tasks.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { ChatService } from '../chat/chat.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

const TELEGRAM_MAX_LENGTH = 4096;

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Bot<Context> | null = null;

  constructor(
    @InjectPinoLogger(TelegramService.name) private readonly logger: PinoLogger,
    private readonly tasks: TasksService,
    private readonly dashboard: DashboardService,
    private readonly chat: ChatService,
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token === 'your-bot-token-from-botfather') {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured, skipping bot initialization');
      return;
    }

    this.bot = new Bot(token);
    this.registerCommands();

    if (process.env.NODE_ENV === 'production') {
      this.logger.info('Telegram bot configured for webhook mode');
    } else {
      this.bot.start();
      this.logger.info('Telegram bot started in polling mode');
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

    this.bot.command('vincular', async (ctx) => {
      const chatId = ctx.from?.id;
      if (!chatId) return;

      const existingUserId = await this.getUserId(chatId);
      if (existingUserId) {
        await ctx.reply('✅ Sua conta já está vinculada!');
        return;
      }

      const code = ctx.message?.text?.replace('/vincular', '').trim();
      if (!code) {
        await ctx.reply('ℹ️ Use: /vincular CODIGO\n\nGere o código em Configurações no app web.');
        return;
      }

      try {
        const result = await this.auth.linkTelegramByCode(code, String(chatId));
        await ctx.reply(`✅ Conta vinculada com sucesso, ${result.name}! Use /ajuda para ver os comandos.`);
      } catch {
        await ctx.reply('❌ Código inválido ou expirado. Gere um novo código no app web.');
      }
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
        await ctx.reply('❌ Conta não vinculada. Use /start para instruções de vinculação.');
        return;
      }

      await ctx.replyWithChatAction('typing');

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

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TasksService } from '../tasks/tasks.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Bot<Context> | null = null;

  constructor(
    @InjectPinoLogger(TelegramService.name) private readonly logger: PinoLogger,
    private readonly tasks: TasksService,
    private readonly dashboard: DashboardService,
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
          'Para conectar sua conta, acesse o app web e vincule seu Telegram nas configurações.',
        );
        return;
      }
      await ctx.reply(
        '✅ Conta conectada! Comandos disponíveis:\n\n' +
        '/hoje — tarefas e eventos de hoje\n' +
        '/prioridades — top 5 tarefas por prioridade\n' +
        '/tarefa [texto] — criar nova tarefa\n' +
        '/ajuda — ver todos os comandos',
      );
    });

    this.bot.command('hoje', async (ctx) => {
      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) return ctx.reply('❌ Conta não vinculada. Use /start para começar.');

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
      if (!userId) return ctx.reply('❌ Conta não vinculada. Use /start para começar.');

      const text = ctx.message?.text?.replace('/tarefa', '').trim();
      if (!text) return ctx.reply('ℹ️ Use: /tarefa [texto da tarefa]');

      await this.tasks.create(userId, { title: text, priority: 3, contextTags: [] });
      await ctx.reply(`✅ Tarefa criada: *${text}*`, { parse_mode: 'Markdown' });
    });

    this.bot.command('prioridades', async (ctx) => {
      const userId = await this.getUserId(ctx.from?.id);
      if (!userId) return ctx.reply('❌ Conta não vinculada. Use /start para começar.');

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
        '/ajuda — esta mensagem\n\n' +
        '💡 Em breve: chat inteligente com memória de longo prazo!',
        { parse_mode: 'Markdown' },
      );
    });

    this.bot.on('message', async (ctx) => {
      await ctx.reply(
        '🤔 Ainda estou aprendendo! Use /ajuda para ver os comandos disponíveis.\n\n' +
        'Em breve poderei responder perguntas contextuais! 🚀',
      );
    });
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

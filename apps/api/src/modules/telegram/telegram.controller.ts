import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('telegram')
@ApiTags('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Webhook do Telegram Bot (produção)' })
  async webhook(
    @Body() update: unknown,
    @Headers('x-telegram-bot-api-secret-token') secret: string,
  ) {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      throw new UnauthorizedException();
    }

    const bot = this.telegramService.getBot();
    if (bot) {
      await bot.handleUpdate(update as never);
    }
    return { ok: true };
  }
}

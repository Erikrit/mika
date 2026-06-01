import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { ChatMessageSchema } from '@mika/shared';

class ChatMessageDto extends createZodDto(ChatMessageSchema) {}

@Controller('chat')
@ApiTags('chat')
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Listar sessões recentes do chat web' })
  listSessions(@CurrentUser() user: AuthUser, @Query('limit') limit?: string) {
    const parsed = parseInt(limit ?? '3', 10);
    const n = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 3, 1), 10);
    return this.chatService.listWebSessions(user.id, n);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Listar mensagens de uma sessão do chat' })
  getSessionMessages(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.chatService.getSessionMessages(user.id, id);
  }

  @Post('message')
  @ApiOperation({ summary: 'Enviar mensagem ao assistente IA' })
  sendMessage(@CurrentUser() user: AuthUser, @Body() dto: ChatMessageDto) {
    return this.chatService.sendMessage(user.id, dto.message, 'WEB', dto.sessionId);
  }

  @Post('message/stream')
  @ApiOperation({ summary: 'Enviar mensagem com resposta em streaming (SSE)' })
  streamMessage(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ) {
    return this.chatService.streamMessage(user.id, dto.message, res, dto.sessionId);
  }
}

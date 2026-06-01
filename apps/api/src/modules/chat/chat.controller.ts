import { Controller, Post, Body, Res } from '@nestjs/common';
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

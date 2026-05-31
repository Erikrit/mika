import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
}

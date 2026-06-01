import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatToolExecutorService } from './chat-tool-executor.service';
import { TasksModule } from '../tasks/tasks.module';
import { EventsModule } from '../events/events.module';
import { MemoryModule } from '../memory/memory.module';
@Module({
  imports: [TasksModule, EventsModule, MemoryModule],
  controllers: [ChatController],
  providers: [ChatService, ChatToolExecutorService],
  exports: [ChatService],
})
export class ChatModule {}

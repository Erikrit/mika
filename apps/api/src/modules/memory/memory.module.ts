import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { MemoryController } from './memory.controller';
import { ContextController } from './context.controller';
import { MemoryRepository } from './memory.repository';
import { MemoryQueueService } from './memory-queue.service';
import { ContextDocumentRepository } from './context-document.repository';
import { ContextDocumentService } from './context-document.service';

@Module({
  controllers: [MemoryController, ContextController],
  providers: [
    MemoryService,
    MemoryRepository,
    MemoryQueueService,
    ContextDocumentRepository,
    ContextDocumentService,
  ],
  exports: [MemoryService, MemoryQueueService],
})
export class MemoryModule {}

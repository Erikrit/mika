import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { MemoryController } from './memory.controller';
import { MemoryRepository } from './memory.repository';
import { MemoryQueueService } from './memory-queue.service';

@Module({
  controllers: [MemoryController],
  providers: [MemoryService, MemoryRepository, MemoryQueueService],
  exports: [MemoryService, MemoryQueueService],
})
export class MemoryModule {}

import { Module } from '@nestjs/common';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { RoutineDataService } from './routine-data.service';
import { RoutineApiKeyGuard } from './guards/routine-api-key.guard';
import { EncryptionService } from '../../common/encryption.service';
import { TelegramModule } from '../telegram/telegram.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [TelegramModule, MemoryModule],
  controllers: [RoutinesController],
  providers: [RoutinesService, RoutineDataService, RoutineApiKeyGuard, EncryptionService],
  exports: [RoutinesService],
})
export class RoutinesModule {}

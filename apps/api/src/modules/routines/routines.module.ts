import { Module } from '@nestjs/common';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { RoutineDataService } from './routine-data.service';
import { RoutineApiKeyGuard } from './guards/routine-api-key.guard';
import { EncryptionService } from '../../common/encryption.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [RoutinesController],
  providers: [RoutinesService, RoutineDataService, RoutineApiKeyGuard, EncryptionService],
  exports: [RoutinesService],
})
export class RoutinesModule {}

import { Module } from '@nestjs/common';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { RoutineDataService } from './routine-data.service';
import { RoutineApiKeyGuard } from './guards/routine-api-key.guard';
import { EncryptionService } from '../../common/encryption.service';
import { MemoryModule } from '../memory/memory.module';
import { RoutineDeliveryModule } from './delivery/routine-delivery.module';

@Module({
  imports: [RoutineDeliveryModule.forRoot(), MemoryModule],
  controllers: [RoutinesController],
  providers: [RoutinesService, RoutineDataService, RoutineApiKeyGuard, EncryptionService],
  exports: [RoutinesService],
})
export class RoutinesModule {}

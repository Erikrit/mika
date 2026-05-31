import { Module } from '@nestjs/common';
import { ReflectionsService } from './reflections.service';
import { ReflectionsController } from './reflections.controller';
import { EncryptionService } from '../../common/encryption.service';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule],
  controllers: [ReflectionsController],
  providers: [ReflectionsService, EncryptionService],
  exports: [ReflectionsService],
})
export class ReflectionsModule {}

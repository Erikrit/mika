import { Module } from '@nestjs/common';
import { ReflectionsService } from './reflections.service';
import { ReflectionsController } from './reflections.controller';
import { EncryptionService } from '../../common/encryption.service';

@Module({
  controllers: [ReflectionsController],
  providers: [ReflectionsService, EncryptionService],
  exports: [ReflectionsService],
})
export class ReflectionsModule {}

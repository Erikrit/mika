import { Module } from '@nestjs/common';
import { LifeAreasService } from './life-areas.service';
import { LifeAreasController } from './life-areas.controller';

@Module({
  controllers: [LifeAreasController],
  providers: [LifeAreasService],
  exports: [LifeAreasService],
})
export class LifeAreasModule {}

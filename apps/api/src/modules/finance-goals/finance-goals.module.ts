import { Module } from '@nestjs/common';
import { FinanceGoalsService } from './finance-goals.service';
import { FinanceGoalsController } from './finance-goals.controller';
import { EncryptionService } from '../../common/encryption.service';

@Module({
  controllers: [FinanceGoalsController],
  providers: [FinanceGoalsService, EncryptionService],
  exports: [FinanceGoalsService],
})
export class FinanceGoalsModule {}

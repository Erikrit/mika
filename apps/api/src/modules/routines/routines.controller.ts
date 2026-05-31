import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { RoutineRunType } from '@mika/database';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { RoutineApiKeyGuard } from './guards/routine-api-key.guard';
import { RoutinesService } from './routines.service';

const TriggerRoutineSchema = z.object({
  userId: z.string().uuid().optional(),
});

class TriggerRoutineDto extends createZodDto(TriggerRoutineSchema) {}

const ROUTINE_TYPES = ['DAILY_SUMMARY', 'WEEKLY_REVIEW', 'MIDDAY_CHECK', 'EVENING_REFLECTION'] as const;

@Controller('routines')
@ApiTags('routines')
export class RoutinesController {
  constructor(private readonly service: RoutinesService) {}

  @Post('daily-summary')
  @Public()
  @UseGuards(RoutineApiKeyGuard)
  @ApiHeader({ name: 'X-Routine-Key', required: true })
  @ApiOperation({ summary: 'Disparar resumo diário (n8n/cron)' })
  dailySummary(@Body() dto: TriggerRoutineDto) {
    return this.service.runDailySummary(dto.userId);
  }

  @Post('midday-check')
  @Public()
  @UseGuards(RoutineApiKeyGuard)
  @ApiHeader({ name: 'X-Routine-Key', required: true })
  @ApiOperation({ summary: 'Disparar check-in meio-dia (n8n/cron)' })
  middayCheck(@Body() dto: TriggerRoutineDto) {
    return this.service.runMiddayCheck(dto.userId);
  }

  @Post('evening-reflection')
  @Public()
  @UseGuards(RoutineApiKeyGuard)
  @ApiHeader({ name: 'X-Routine-Key', required: true })
  @ApiOperation({ summary: 'Disparar reflexão noturna (n8n/cron)' })
  eveningReflection(@Body() dto: TriggerRoutineDto) {
    return this.service.runEveningReflection(dto.userId);
  }

  @Post('weekly-review')
  @Public()
  @UseGuards(RoutineApiKeyGuard)
  @ApiHeader({ name: 'X-Routine-Key', required: true })
  @ApiOperation({ summary: 'Disparar revisão semanal (n8n/cron)' })
  weeklyReview(@Body() dto: TriggerRoutineDto) {
    return this.service.runWeeklyReview(dto.userId);
  }

  @Get('latest')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Última execução de rotina (dashboard web)' })
  getLatest(
    @CurrentUser() user: AuthUser,
    @Query('type') type: string = 'DAILY_SUMMARY',
  ) {
    const routineType = ROUTINE_TYPES.includes(type as (typeof ROUTINE_TYPES)[number])
      ? (type as RoutineRunType)
      : 'DAILY_SUMMARY';

    return this.service.getLatest(user.id, routineType);
  }
}

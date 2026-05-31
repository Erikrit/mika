import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('today')
  @ApiOperation({ summary: 'Resumo do dia (tarefas, eventos, atrasadas)' })
  getToday(@CurrentUser() user: AuthUser) {
    return this.service.getToday(user.id);
  }
}

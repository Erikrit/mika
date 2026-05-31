import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('today')
  getToday(@CurrentUser() user: AuthUser) {
    return this.service.getToday(user.id);
  }
}

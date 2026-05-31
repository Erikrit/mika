import { Controller, Get } from '@nestjs/common';
import { LifeAreasService } from './life-areas.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('life-areas')
export class LifeAreasController {
  constructor(private readonly service: LifeAreasService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.id);
  }
}

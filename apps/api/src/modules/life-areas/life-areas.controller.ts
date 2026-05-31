import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LifeAreasService } from './life-areas.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';

@Controller('life-areas')
@ApiTags('life-areas')
@ApiBearerAuth()
export class LifeAreasController {
  constructor(private readonly service: LifeAreasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar áreas de vida do usuário' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.id);
  }
}

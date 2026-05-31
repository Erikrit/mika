import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateGoalSchema, UpdateGoalSchema } from '@mika/shared';

class CreateGoalDto extends createZodDto(CreateGoalSchema) {}
class UpdateGoalDto extends createZodDto(UpdateGoalSchema) {}

@Controller('goals')
export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGoalDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('horizon') horizon?: string) {
    return this.service.findAll(user.id, horizon);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

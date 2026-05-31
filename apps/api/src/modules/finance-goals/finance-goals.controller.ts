import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { FinanceGoalsService } from './finance-goals.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateFinanceGoalSchema, UpdateFinanceGoalSchema } from '@mika/shared';

class CreateFinanceGoalDto extends createZodDto(CreateFinanceGoalSchema) {}
class UpdateFinanceGoalDto extends createZodDto(UpdateFinanceGoalSchema) {}

@Controller('finance-goals')
export class FinanceGoalsController {
  constructor(private readonly service: FinanceGoalsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFinanceGoalDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateFinanceGoalDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateTaskSchema, UpdateTaskSchema, TaskFiltersSchema } from '@mika/shared';

class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
class TaskFiltersDto extends createZodDto(TaskFiltersSchema) {}

@Controller('tasks')
@ApiTags('tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tarefas com filtros' })
  findAll(@CurrentUser() user: AuthUser, @Query() filters: TaskFiltersDto) {
    return this.service.findAll(user.id, filters);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(user.id, id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Marcar tarefa como concluída' })
  complete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.complete(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

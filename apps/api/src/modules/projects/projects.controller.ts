import {
  Controller, Get, Post, Patch, Delete, Body, Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateProjectSchema, UpdateProjectSchema } from '@mika/shared';

class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}

@Controller('projects')
@ApiTags('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
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
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

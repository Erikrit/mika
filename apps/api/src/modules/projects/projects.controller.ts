import {
  Controller, Get, Post, Patch, Delete, Body, Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectDraftAiService } from './project-draft-ai.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import {
  CreateProjectDraftSchema,
  CreateProjectFromDraftSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
} from '@mika/shared';

class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
class CreateProjectDraftDto extends createZodDto(CreateProjectDraftSchema) {}
class CreateProjectFromDraftDto extends createZodDto(CreateProjectFromDraftSchema) {}

@Controller('projects')
@ApiTags('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(
    private readonly service: ProjectsService,
    private readonly draftAi: ProjectDraftAiService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.service.create(user.id, dto);
  }

  @Post('draft')
  @ApiOperation({ summary: 'Gerar rascunho de projeto com Mika' })
  createDraft(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDraftDto) {
    return this.draftAi.createDraft(user.id, dto);
  }

  @Post('from-draft')
  @ApiOperation({ summary: 'Criar projeto e tarefas a partir de rascunho aprovado' })
  createFromDraft(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectFromDraftDto) {
    return this.service.createFromDraft(user.id, dto);
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

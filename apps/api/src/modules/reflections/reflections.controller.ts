import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReflectionsService } from './reflections.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateReflectionSchema } from '@mika/shared';

class CreateReflectionDto extends createZodDto(CreateReflectionSchema) {}

@Controller('reflections')
@ApiTags('reflections')
@ApiBearerAuth()
export class ReflectionsController {
  constructor(private readonly service: ReflectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar reflexão (conteúdo criptografado em repouso)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReflectionDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reflexões (descriptografadas na resposta)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

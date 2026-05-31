import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ReflectionsService } from './reflections.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateReflectionSchema } from '@mika/shared';

class CreateReflectionDto extends createZodDto(CreateReflectionSchema) {}

@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly service: ReflectionsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReflectionDto) {
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

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

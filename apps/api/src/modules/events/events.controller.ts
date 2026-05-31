import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { CreateEventSchema, UpdateEventSchema, EventFiltersSchema } from '@mika/shared';

class CreateEventDto extends createZodDto(CreateEventSchema) {}
class UpdateEventDto extends createZodDto(UpdateEventSchema) {}
class EventFiltersDto extends createZodDto(EventFiltersSchema) {}

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() filters: EventFiltersDto) {
    return this.service.findAll(user.id, filters);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}

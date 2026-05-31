import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEventDto, UpdateEventDto, EventFilters } from '@mika/shared';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        userId,
        lifeAreaId: dto.lifeAreaId,
        title: dto.title,
        description: dto.description,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        location: dto.location,
        isAllDay: dto.isAllDay,
        source: (dto.source ?? 'manual').toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
  }

  async findAll(userId: string, filters: EventFilters) {
    return this.prisma.event.findMany({
      where: {
        userId,
        lifeAreaId: filters.lifeAreaId,
        startsAt: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      orderBy: { startsAt: 'asc' },
      include: { lifeArea: true },
    });
  }

  async findOne(userId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, userId },
      include: { lifeArea: true },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    await this.findOne(userId, id);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        source: dto.source?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.event.delete({ where: { id } });
  }

  async getTodayEvents(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.event.findMany({
      where: {
        userId,
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startsAt: 'asc' },
      include: { lifeArea: true },
    });
  }
}

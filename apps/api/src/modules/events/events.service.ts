import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderSchedulerService } from '../reminders/reminder-scheduler.service';
import type { CreateEventDto, UpdateEventDto, EventFilters } from '@mika/shared';

@Injectable()
export class EventsService {
  constructor(
    @InjectPinoLogger(EventsService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly reminders: ReminderSchedulerService,
  ) {}

  async create(userId: string, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
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
    this.syncEventReminderAsync(
      userId,
      event.id,
      event.title,
      event.startsAt,
      event.location,
    );
    return event;
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
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        source: dto.source?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
    this.syncEventReminderAsync(
      userId,
      event.id,
      event.title,
      event.startsAt,
      event.location,
    );
    return event;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    this.cancelEventRemindersAsync(userId, id);
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

  async getEventsBetween(userId: string, from: Date, to: Date) {
    return this.prisma.event.findMany({
      where: {
        userId,
        startsAt: { gte: from, lte: to },
      },
      orderBy: { startsAt: 'asc' },
      include: { lifeArea: true },
    });
  }

  private syncEventReminderAsync(
    userId: string,
    eventId: string,
    title: string,
    startsAt: Date,
    location: string | null,
  ) {
    void this.reminders
      .syncEventReminder(userId, eventId, title, startsAt, location)
      .catch((err) => {
        this.logger.warn({ err, eventId }, 'Falha ao enfileirar lembrete de evento');
      });
  }

  private cancelEventRemindersAsync(userId: string, eventId: string) {
    void this.reminders.cancelEntityReminders(userId, 'EVENT', eventId).catch((err) => {
      this.logger.warn({ err, eventId }, 'Falha ao cancelar lembretes de evento');
    });
  }
}

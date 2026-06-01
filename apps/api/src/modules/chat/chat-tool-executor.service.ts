import { Injectable } from '@nestjs/common';
import type { ChatChannel } from '@prisma/client';
import type { ChatToolExecutors } from '@mika/ai';
import { TasksService } from '../tasks/tasks.service';
import { EventsService } from '../events/events.service';
import { MemoryService } from '../memory/memory.service';
@Injectable()
export class ChatToolExecutorService {
  constructor(
    private readonly tasks: TasksService,
    private readonly events: EventsService,
    private readonly memory: MemoryService,
  ) {}

  createExecutors(
    userId: string,
    channel: ChatChannel,
  ): ChatToolExecutors {
    const auditChannel = channel === 'TELEGRAM' ? 'TELEGRAM' : 'CHAT';

    return {
      getTasks: async (params) => {
        const list = await this.tasks.findAll(userId, {
          status: params.status as never,
          dueFrom: params.dueFrom ? new Date(params.dueFrom) : undefined,
          dueTo: params.dueTo ? new Date(params.dueTo) : undefined,
        });
        const limited = params.limit ? list.slice(0, params.limit) : list;
        if (limited.length === 0) {
          return JSON.stringify({ tasks: [], message: 'Nenhuma tarefa encontrada' });
        }
        return JSON.stringify({
          tasks: limited.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueAt: t.dueAt?.toISOString() ?? null,
            lifeArea: t.lifeArea?.label ?? null,
          })),
        });
      },

      getEvents: async (params) => {
        const from = params.from
          ? new Date(params.from)
          : new Date();
        const to = params.to
          ? new Date(params.to)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const list = await this.events.findAll(userId, { from, to });
        if (list.length === 0) {
          return JSON.stringify({ events: [], message: 'Nenhum evento no período' });
        }
        return JSON.stringify({
          events: list.map((e) => ({
            id: e.id,
            title: e.title,
            startsAt: e.startsAt.toISOString(),
            endsAt: e.endsAt?.toISOString() ?? null,
            location: e.location ?? null,
            isAllDay: e.isAllDay,
          })),
        });
      },

      searchMemory: async (params) => {
        const result = await this.memory.retrieveContext(userId, params.query);
        if (result.sensitiveChunkIds.length > 0) {
          await this.memory.auditRetrievedChunks(
            userId,
            result.sensitiveChunkIds,
            auditChannel,
          );
        }
        if (!result.context && !result.fixedProfile) {
          return JSON.stringify({
            found: false,
            message: `Não encontrei informações sobre "${params.query}"`,
          });
        }
        return JSON.stringify({
          found: true,
          context: result.context || null,
          fixedProfile: result.fixedProfile || null,
        });
      },

      createTask: async (params) => {
        const task = await this.tasks.create(userId, {
          title: params.title,
          dueAt: params.dueAt ? new Date(params.dueAt) : undefined,
          priority: (params.priority ?? 3) as 1 | 2 | 3 | 4 | 5,
          contextTags: [],
        });
        return JSON.stringify({
          success: true,
          task: {
            id: task.id,
            title: task.title,
            dueAt: task.dueAt?.toISOString() ?? null,
            priority: task.priority,
          },
        });
      },
    };
  }
}

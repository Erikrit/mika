import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { ChatChannel } from '@prisma/client';
import type { ChatToolExecutors } from '@mika/ai';
import type { UpdateTaskDto } from '@mika/shared';
import { TasksService } from '../tasks/tasks.service';
import { EventsService } from '../events/events.service';
import { MemoryService } from '../memory/memory.service';
@Injectable()
export class ChatToolExecutorService {
  constructor(
    @InjectPinoLogger(ChatToolExecutorService.name)
    private readonly logger: PinoLogger,
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
        this.logger.info(
          { userId, tool: 'create_task', taskId: task.id, success: true },
          'chat tool mutation',
        );
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

      updateTask: async (params) => {
        try {
          const dto: UpdateTaskDto = {};
          if (params.title !== undefined) dto.title = params.title;
          if (params.dueAt !== undefined) dto.dueAt = new Date(params.dueAt);
          if (params.priority !== undefined) {
            dto.priority = params.priority as 1 | 2 | 3 | 4 | 5;
          }

          const task = await this.tasks.update(userId, params.taskId, dto);
          this.logger.info(
            { userId, tool: 'update_task', taskId: params.taskId, success: true },
            'chat tool mutation',
          );
          return JSON.stringify({
            success: true,
            task: {
              id: task.id,
              title: task.title,
              dueAt: task.dueAt?.toISOString() ?? null,
              priority: task.priority,
            },
          });
        } catch (err) {
          if (err instanceof NotFoundException) {
            this.logger.info(
              { userId, tool: 'update_task', taskId: params.taskId, success: false },
              'chat tool mutation',
            );
            return JSON.stringify({
              success: false,
              message: 'Tarefa não encontrada',
            });
          }
          throw err;
        }
      },

      deleteTask: async (params) => {
        try {
          await this.tasks.remove(userId, params.taskId);
          this.logger.info(
            { userId, tool: 'delete_task', taskId: params.taskId, success: true },
            'chat tool mutation',
          );
          return JSON.stringify({
            success: true,
            deletedId: params.taskId,
          });
        } catch (err) {
          if (err instanceof NotFoundException) {
            this.logger.info(
              { userId, tool: 'delete_task', taskId: params.taskId, success: false },
              'chat tool mutation',
            );
            return JSON.stringify({
              success: false,
              message: 'Tarefa não encontrada',
            });
          }
          throw err;
        }
      },
    };
  }
}

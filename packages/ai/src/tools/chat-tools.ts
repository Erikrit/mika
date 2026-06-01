import { tool } from 'ai';
import type { ChatToolExecutors } from './types';
import {
  createTaskParams,
  getEventsParams,
  getTasksParams,
  searchMemoryParams,
} from './types';

export function buildChatTools(executors: ChatToolExecutors) {
  return {
    get_tasks: tool({
      description:
        'Lista tarefas do usuário com filtros opcionais. Use para prioridades, pendências e planejamento semanal.',
      parameters: getTasksParams,
      execute: async (params) => executors.getTasks(params),
    }),
    get_events: tool({
      description:
        'Lista compromissos/eventos do usuário em um período. Use para agenda da semana.',
      parameters: getEventsParams,
      execute: async (params) => executors.getEvents(params),
    }),
    search_memory: tool({
      description:
        'Busca na memória de longo prazo (projetos, notas importadas, histórico). Use para perguntas sobre temas específicos.',
      parameters: searchMemoryParams,
      execute: async (params) => executors.searchMemory(params),
    }),
    create_task: tool({
      description:
        'Cria uma nova tarefa quando o usuário pedir para lembrar ou registrar algo.',
      parameters: createTaskParams,
      execute: async (params) => executors.createTask(params),
    }),
  };
}

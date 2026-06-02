import { tool } from 'ai';
import type { ChatToolExecutors } from './types';
import {
  createTaskParams,
  deleteTaskParams,
  getEventsParams,
  getTasksParams,
  searchMemoryParams,
  updateTaskParams,
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
        'Cria uma nova tarefa. Use apenas para tarefas novas; nunca para excluir ou renomear tarefas existentes.',
      parameters: createTaskParams,
      execute: async (params) => executors.createTask(params),
    }),
    update_task: tool({
      description:
        'Atualiza uma tarefa existente por id. O taskId é obrigatório (obtenha via get_tasks).',
      parameters: updateTaskParams,
      execute: async (params) => executors.updateTask(params),
    }),
    delete_task: tool({
      description:
        'Exclui uma tarefa por id obtido de get_tasks. Proibido criar tarefa com nome "excluir/deletar".',
      parameters: deleteTaskParams,
      execute: async (params) => executors.deleteTask(params),
    }),
  };
}

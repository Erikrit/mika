import { z } from 'zod';

export type ChatToolExecutors = {
  getTasks: (params: {
    status?: string;
    dueFrom?: string;
    dueTo?: string;
    limit?: number;
  }) => Promise<string>;
  getEvents: (params: { from?: string; to?: string }) => Promise<string>;
  searchMemory: (params: { query: string }) => Promise<string>;
  createTask: (params: {
    title: string;
    dueAt?: string;
    priority?: number;
  }) => Promise<string>;
  updateTask: (params: {
    taskId: string;
    title?: string;
    dueAt?: string;
    priority?: number;
  }) => Promise<string>;
  deleteTask: (params: { taskId: string }) => Promise<string>;
};

export const getTasksParams = z.object({
  status: z
    .enum(['todo', 'in_progress', 'done', 'cancelled'])
    .optional()
    .describe('Filtrar por status'),
  dueFrom: z.string().optional().describe('ISO date — início do período'),
  dueTo: z.string().optional().describe('ISO date — fim do período'),
  limit: z.number().min(1).max(50).optional().describe('Máximo de tarefas'),
});

export const getEventsParams = z.object({
  from: z.string().optional().describe('ISO date — início'),
  to: z.string().optional().describe('ISO date — fim'),
});

export const searchMemoryParams = z.object({
  query: z.string().describe('Termo ou pergunta para buscar na memória'),
});

export const createTaskParams = z.object({
  title: z.string().describe('Título da tarefa'),
  dueAt: z.string().optional().describe('ISO datetime de vencimento'),
  priority: z.number().min(1).max(5).optional().describe('Prioridade 1-5'),
});

export const updateTaskParams = z.object({
  taskId: z.string().describe('ID da tarefa obtido via get_tasks'),
  title: z.string().optional().describe('Novo título'),
  dueAt: z.string().optional().describe('ISO datetime de vencimento'),
  priority: z.number().min(1).max(5).optional().describe('Prioridade 1-5'),
});

export const deleteTaskParams = z.object({
  taskId: z.string().describe('ID da tarefa a excluir, obtido via get_tasks'),
});

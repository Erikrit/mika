import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(500),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  lifeAreaId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  dueAt: z.coerce.date().optional(),
  energyLevel: z.enum(['low', 'medium', 'high']).optional(),
  contextTags: z.array(z.string()).default([]),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
});

export const TaskFiltersSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  lifeAreaId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  lifeAreaId: z.string().uuid(),
  priority: z.number().int().min(1).max(5).default(3),
  status: z.enum(['active', 'paused', 'completed', 'archived']).default('active'),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const CreateGoalSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  lifeAreaId: z.string().uuid(),
  horizon: z.enum(['short', 'medium', 'long']),
  status: z.enum(['active', 'achieved', 'abandoned']).default('active'),
  targetDate: z.coerce.date().optional(),
  progress: z.number().int().min(0).max(100).default(0),
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  lifeAreaId: z.string().uuid().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  source: z.enum(['manual', 'google', 'telegram']).default('manual'),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const EventFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  lifeAreaId: z.string().uuid().optional(),
});

export const CreateReflectionSchema = z.object({
  content: z.string().min(1),
  energyLevel: z.enum(['low', 'medium', 'high']).optional(),
  mood: z.string().optional(),
  routineType: z.enum(['morning', 'midday', 'evening', 'free']).optional(),
});

export const CreateFinanceGoalSchema = z.object({
  title: z.string().min(1).max(500),
  lifeAreaId: z.string().uuid(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  currency: z.string().default('BRL'),
  targetDate: z.coerce.date().optional(),
  status: z.enum(['active', 'achieved', 'paused']).default('active'),
});

export const UpdateFinanceGoalSchema = CreateFinanceGoalSchema.partial();

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
export type TaskFilters = z.infer<typeof TaskFiltersSchema>;
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
export type EventFilters = z.infer<typeof EventFiltersSchema>;
export type CreateReflectionDto = z.infer<typeof CreateReflectionSchema>;
export type CreateFinanceGoalDto = z.infer<typeof CreateFinanceGoalSchema>;
export type UpdateFinanceGoalDto = z.infer<typeof UpdateFinanceGoalSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type ChatMessageDto = z.infer<typeof ChatMessageSchema>;

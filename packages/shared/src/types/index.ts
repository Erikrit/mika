export type LifeAreaSlug = 'professional' | 'financial' | 'family' | 'health' | 'travel';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 'low' | 'medium' | 'high';

export type GoalHorizon = 'short' | 'medium' | 'long';
export type GoalStatus = 'active' | 'achieved' | 'abandoned';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export type EventSource = 'manual' | 'google' | 'telegram';

export type RoutineType = 'morning' | 'midday' | 'evening' | 'free';

export type FinanceGoalStatus = 'active' | 'achieved' | 'paused';

export type ReminderChannel = 'telegram' | 'web_push' | 'both';
export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type ReminderEntityType = 'task' | 'event' | 'goal' | 'custom';

export type ChatChannel = 'web' | 'telegram';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  telegramChatId?: string;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LifeArea {
  id: string;
  userId: string;
  slug: LifeAreaSlug;
  label: string;
  color?: string;
  icon?: string;
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  lifeAreaId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: Date;
  completedAt?: Date;
  energyLevel?: EnergyLevel;
  contextTags: string[];
  neglectedSince?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  lifeAreaId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate?: Date;
  targetDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  lifeAreaId: string;
  title: string;
  description?: string;
  horizon: GoalHorizon;
  status: GoalStatus;
  targetDate?: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  userId: string;
  lifeAreaId?: string;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt?: Date;
  location?: string;
  isAllDay: boolean;
  externalId?: string;
  source: EventSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reflection {
  id: string;
  userId: string;
  content: string;
  energyLevel?: EnergyLevel;
  mood?: string;
  routineType?: RoutineType;
  createdAt: Date;
}

export interface FinanceGoal {
  id: string;
  userId: string;
  lifeAreaId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: Date;
  status: FinanceGoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardToday {
  tasks: Task[];
  events: Event[];
  overdueTasks: number;
}

export * from './context';
export * from './memory';

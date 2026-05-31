export type RoutineTaskItem = {
  title: string;
  priority: number;
  dueAt?: Date | null;
  overdue?: boolean;
  daysOverdue?: number;
};

export type RoutineEventItem = {
  title: string;
  startsAt: Date;
  isAllDay: boolean;
  location?: string | null;
};

export type RoutineNeglectedItem = {
  title: string;
  type: 'task' | 'goal';
  daysSinceUpdate: number;
};

export type DailySummaryData = {
  date: string;
  topTasks: RoutineTaskItem[];
  events: RoutineEventItem[];
  overdueTasks: RoutineTaskItem[];
  neglectedGoals: RoutineNeglectedItem[];
  morningPriority?: string | null;
};

export type WeeklyReviewData = {
  weekStart: string;
  weekEnd: string;
  completedTasks: Array<{ title: string; completedAt: Date }>;
  overdueTasks: RoutineTaskItem[];
  neglectedItems: RoutineNeglectedItem[];
  nextWeekEvents: RoutineEventItem[];
  completedCount: number;
};

export type MiddayCheckData = {
  date: string;
  pendingTasks: RoutineTaskItem[];
  morningPriority?: string | null;
  completedTodayCount: number;
};

export type EveningReflectionData = {
  date: string;
  completedTasks: Array<{ title: string }>;
  pendingTasks: RoutineTaskItem[];
  eventsToday: RoutineEventItem[];
};

export type RoutineType =
  | 'DAILY_SUMMARY'
  | 'WEEKLY_REVIEW'
  | 'MIDDAY_CHECK'
  | 'EVENING_REFLECTION';

export type GenerateRoutineResult = {
  content: string;
  status: 'success' | 'fallback';
  latencyMs: number;
};

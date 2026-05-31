import { api } from '@/lib/api';
import type { Task } from '@mika/shared';

export interface DashboardData {
  tasks: Task[];
  events: Array<{
    id: string;
    title: string;
    startsAt: string;
    endsAt?: string;
    isAllDay: boolean;
    location?: string;
    lifeArea?: { label: string; color: string };
  }>;
  overdueTasks: number;
}

export const dashboardApi = {
  getToday: () => api.get<DashboardData>('/dashboard/today').then(r => r.data),
};

export const tasksApi = {
  list: (params?: Record<string, string>) =>
    api.get<Task[]>('/tasks', { params }).then(r => r.data),
  create: (data: Partial<Task>) => api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data).then(r => r.data),
  complete: (id: string) => api.post<Task>(`/tasks/${id}/complete`).then(r => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const lifeAreasApi = {
  list: () => api.get<Array<{ id: string; slug: string; label: string; color: string; icon: string }>>('/life-areas').then(r => r.data),
};

export const projectsApi = {
  list: () => api.get('/projects').then(r => r.data),
  create: (data: unknown) => api.post('/projects', data).then(r => r.data),
};

export const goalsApi = {
  list: (horizon?: string) => api.get('/goals', { params: horizon ? { horizon } : {} }).then(r => r.data),
  create: (data: unknown) => api.post('/goals', data).then(r => r.data),
};

export const eventsApi = {
  list: (params?: Record<string, string>) => api.get('/events', { params }).then(r => r.data),
  create: (data: unknown) => api.post('/events', data).then(r => r.data),
};

import { api } from '@/lib/api';
import { API_BASE_PATH } from '@/lib/api-config';
import type {
  Task,
  Goal,
  Project,
  Event,
  Reflection,
  CreateGoalDto,
  UpdateGoalDto,
  CreateProjectDto,
  CreateProjectDraftDto,
  CreateProjectFromDraftDto,
  ProjectDraftDto,
  UpdateProjectDto,
  CreateEventDto,
  UpdateEventDto,
  CreateReflectionDto,
} from '@mika/shared';

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

export interface DashboardProjectSummary extends ProjectListItem {
  taskCount: number;
  completionPercentage: number;
}

export interface DashboardOverviewData {
  range: { from: string; to: string };
  today: {
    tasks: Task[];
    events: EventListItem[];
    overdueTasksCount: number;
  };
  week: {
    tasks: Task[];
    events: EventListItem[];
  };
  overdueTasks: Task[];
  backlogFocusTasks: Task[];
  priorityTasks: Task[];
  activeProjects: DashboardProjectSummary[];
}

export const dashboardApi = {
  getToday: () => api.get<DashboardData>('/dashboard/today').then(r => r.data),
  getOverview: () => api.get<DashboardOverviewData>('/dashboard/overview').then((r) => r.data),
};

export interface RoutineRunItem {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  deliveredAt?: string | null;
  metadata?: Record<string, unknown>;
}

export const routinesApi = {
  getLatest: (type = 'DAILY_SUMMARY') =>
    api
      .get<RoutineRunItem | null>('/routines/latest', { params: { type } })
      .then((r) => r.data),
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

export interface ProjectListItem extends Project {
  lifeArea?: { label: string; color: string };
  _count?: { tasks: number };
  taskCount?: number;
  completionPercentage?: number;
}

export interface GoalListItem extends Goal {
  lifeArea?: { label: string; color: string };
  isOverdue?: boolean;
}

export interface EventListItem extends Event {
  lifeArea?: { label: string; color: string };
}

export const projectsApi = {
  list: () => api.get<ProjectListItem[]>('/projects').then((r) => r.data),
  get: (id: string) => api.get<ProjectListItem>(`/projects/${id}`).then((r) => r.data),
  create: (data: CreateProjectDto) => api.post<Project>('/projects', data).then((r) => r.data),
  createDraft: (data: CreateProjectDraftDto) =>
    api.post<ProjectDraftDto>('/projects/draft', data).then((r) => r.data),
  createFromDraft: (data: CreateProjectFromDraftDto) =>
    api.post<{ project: Project; tasks: Task[] }>('/projects/from-draft', data).then((r) => r.data),
  update: (id: string, data: UpdateProjectDto) =>
    api.patch<Project>(`/projects/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const goalsApi = {
  list: (horizon?: string) =>
    api.get<GoalListItem[]>('/goals', { params: horizon ? { horizon } : {} }).then((r) => r.data),
  get: (id: string) => api.get<GoalListItem>(`/goals/${id}`).then((r) => r.data),
  create: (data: CreateGoalDto) => api.post<Goal>('/goals', data).then((r) => r.data),
  update: (id: string, data: UpdateGoalDto) =>
    api.patch<Goal>(`/goals/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

export const eventsApi = {
  list: (params?: Record<string, string>) =>
    api.get<EventListItem[]>('/events', { params }).then((r) => r.data),
  get: (id: string) => api.get<EventListItem>(`/events/${id}`).then((r) => r.data),
  create: (data: CreateEventDto) => api.post<Event>('/events', data).then((r) => r.data),
  update: (id: string, data: UpdateEventDto) =>
    api.patch<Event>(`/events/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

export const reflectionsApi = {
  list: () => api.get<Reflection[]>('/reflections').then((r) => r.data),
  get: (id: string) => api.get<Reflection>(`/reflections/${id}`).then((r) => r.data),
  create: (data: CreateReflectionDto) =>
    api.post<Reflection>('/reflections', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/reflections/${id}`),
};

export interface ChatSessionItem {
  id: string;
  title: string | null;
  updatedAt: string;
  preview: string | null;
  messageCount: number;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const chatApi = {
  listSessions: (limit = 3) =>
    api
      .get<ChatSessionItem[]>('/chat/sessions', { params: { limit } })
      .then((r) => r.data),

  getSessionMessages: (sessionId: string) =>
    api
      .get<ChatMessageItem[]>(`/chat/sessions/${sessionId}/messages`)
      .then((r) => r.data),

  sendMessage: (message: string, sessionId?: string) =>
    api
      .post<{ sessionId: string; reply: string; createdAt: string }>('/chat/message', {
        message,
        sessionId,
      })
      .then((r) => r.data),

  streamMessage: async (
    message: string,
    sessionId: string | undefined,
    onToken: (token: string) => void,
  ): Promise<{ sessionId: string; reply: string; createdAt: string }> => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('mika_access_token') : null;

    const res = await fetch(`${API_BASE_PATH}/chat/message/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) {
      throw new Error('Falha ao enviar mensagem');
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Stream indisponível');

    const decoder = new TextDecoder();
    let buffer = '';
    let result: { sessionId: string; reply: string; createdAt: string } | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = JSON.parse(line.slice(6)) as {
          token?: string;
          done?: boolean;
          sessionId?: string;
          reply?: string;
          createdAt?: string;
          error?: string;
        };

        if (payload.error) throw new Error(payload.error);
        if (payload.token) onToken(payload.token);
        if (payload.done && payload.sessionId && payload.reply && payload.createdAt) {
          result = {
            sessionId: payload.sessionId,
            reply: payload.reply,
            createdAt: payload.createdAt,
          };
        }
      }
    }

    if (!result) throw new Error('Resposta incompleta');
    return result;
  },
};

export interface MemoryChunkItem {
  id: string;
  content: string;
  sourceType: string;
  sourceId: string | null;
  lifeAreaId: string | null;
  memoryType?: string;
  privacyLevel?: string;
  enabledForRag?: boolean;
  importance?: number;
  createdAt: string;
  updatedAt: string;
  lifeArea?: { label: string; slug: string; color: string | null };
  document?: { id: string; title: string; category: string };
}

export interface ContextDocumentItem {
  id: string;
  title: string;
  category: string;
  memoryType: string;
  privacyLevel: string;
  enabledForRag: boolean;
  source?: string;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  currentVersion?: {
    id?: string;
    versionNumber: number;
    createdAt: string;
    content?: string;
  };
  _count?: { chunks: number; versions: number };
}

export interface ContextDocumentVersionItem {
  id: string;
  versionNumber: number;
  contentHash: string;
  createdAt: string;
  content?: string;
  preview?: string;
}

export interface CreateContextDocumentInput {
  title: string;
  content: string;
  category?: string;
  memoryType?: string;
  privacyLevel?: string;
  enabledForRag?: boolean;
  source?: 'import' | 'manual';
}

export const contextApi = {
  listDocuments: (includeArchived?: boolean) =>
    api
      .get<ContextDocumentItem[]>('/context/documents', {
        params: includeArchived ? { includeArchived: 'true' } : {},
      })
      .then((r) => r.data),
  getDocument: (id: string) =>
    api.get<ContextDocumentItem>(`/context/documents/${id}`).then((r) => r.data),
  createDocument: (data: CreateContextDocumentInput) =>
    api.post<ContextDocumentItem>('/context/documents', data).then((r) => r.data),
  reimportDocument: (id: string, content: string) =>
    api
      .post(`/context/documents/${id}/reimport`, { content })
      .then((r) => r.data),
  getVersions: (id: string, preview?: boolean) =>
    api
      .get<ContextDocumentVersionItem[]>(`/context/documents/${id}/versions`, {
        params: preview ? { preview: 'true' } : {},
      })
      .then((r) => r.data),
  getVersion: (id: string, versionId: string) =>
    api
      .get<ContextDocumentVersionItem>(
        `/context/documents/${id}/versions/${versionId}`,
      )
      .then((r) => r.data),
  updateDocument: (id: string, data: Record<string, unknown>) =>
    api.patch(`/context/documents/${id}`, data).then((r) => r.data),
  deleteDocument: (id: string) =>
    api.delete(`/context/documents/${id}`).then((r) => r.data),
};

export interface MemoryHealthData {
  totalChunks: number;
  totalDocuments: number;
  byMemoryType: { FIXED: number; EVOLUTIVE: number; SENSITIVE: number };
  byPrivacyLevel: { PUBLIC: number; PRIVATE: number; SENSITIVE: number };
  duplicates: number;
  orphans: number;
  disabledForRag: number;
  archived: number;
}

export const memoryApi = {
  listChunks: (lifeAreaId?: string) =>
    api
      .get<MemoryChunkItem[]>('/memory/chunks', {
        params: lifeAreaId ? { lifeAreaId } : {},
      })
      .then((r) => r.data),
  updateChunk: (id: string, data: Record<string, unknown>) =>
    api.patch(`/memory/chunks/${id}`, data).then((r) => r.data),
  deleteChunk: (id: string) =>
    api.delete(`/memory/chunks/${id}`).then((r) => r.data),
  getHealth: () =>
    api.get<MemoryHealthData>('/memory/health').then((r) => r.data),
  listAudit: (page = 1) =>
    api.get<{ items: Array<{ id: string; channel: string; createdAt: string; chunk?: { content: string } }>; total: number }>(
      '/memory/audit',
      { params: { page } },
    ).then((r) => r.data),
  search: (query: string, lifeAreaId?: string) =>
    api
      .post('/memory/search', { query, lifeAreaId })
      .then((r) => r.data),
  importMarkdown: (
    file: File,
    opts?: {
      lifeAreaId?: string;
      documentId?: string;
      title?: string;
      category?: string;
      memoryType?: string;
      privacyLevel?: string;
    },
  ) => {
    const form = new FormData();
    form.append('file', file);
    if (opts?.lifeAreaId) form.append('lifeAreaId', opts.lifeAreaId);
    if (opts?.documentId) form.append('documentId', opts.documentId);
    if (opts?.title) form.append('title', opts.title);
    if (opts?.category) form.append('category', opts.category);
    if (opts?.memoryType) form.append('memoryType', opts.memoryType);
    if (opts?.privacyLevel) form.append('privacyLevel', opts.privacyLevel);
    return api.post('/memory/import', form).then((r) => r.data);
  },
};

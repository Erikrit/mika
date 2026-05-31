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

export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api
      .post<{ sessionId: string; reply: string; createdAt: string }>('/chat/message', {
        message,
        sessionId,
      })
      .then((r) => r.data),
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
    return api
      .post('/memory/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};

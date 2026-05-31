export type MemorySourceType =
  | 'TASK'
  | 'PROJECT'
  | 'GOAL'
  | 'REFLECTION'
  | 'NOTE'
  | 'IMPORT';

export type MemoryIndexAction = 'upsert' | 'delete';

export type MemoryIndexJob = {
  userId: string;
  sourceType: MemorySourceType;
  sourceId: string;
  action: MemoryIndexAction;
  content?: string;
  lifeAreaId?: string | null;
  metadata?: Record<string, unknown>;
};

export type RetrievedChunk = {
  id: string;
  content: string;
  sourceType: MemorySourceType;
  sourceId: string | null;
  lifeAreaId: string | null;
  lifeAreaLabel?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  vectorScore?: number;
  textScore?: number;
  contentHash: string;
  finalScore?: number;
};

export type MemorySearchInput = {
  query: string;
  lifeAreaId?: string;
  topK?: number;
};

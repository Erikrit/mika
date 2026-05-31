import type {
  ConfidenceType,
  ContextCategory,
  MemoryType,
  PrivacyLevel,
  RetentionType,
} from './context';

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
  documentId?: string | null;
  memoryType?: MemoryType;
  privacyLevel?: PrivacyLevel;
  category?: ContextCategory;
  importance?: number;
  confidenceType?: ConfidenceType;
  confidenceScore?: number;
  enabledForRag?: boolean;
  metadata?: Record<string, unknown>;
};

export type RetrievedChunk = {
  id: string;
  content: string;
  sourceType: MemorySourceType;
  sourceId: string | null;
  lifeAreaId: string | null;
  lifeAreaLabel?: string;
  documentId?: string | null;
  memoryType?: MemoryType;
  privacyLevel?: PrivacyLevel;
  category?: ContextCategory;
  importance?: number;
  confidenceType?: ConfidenceType;
  confidenceScore?: number;
  enabledForRag?: boolean;
  retentionType?: RetentionType;
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

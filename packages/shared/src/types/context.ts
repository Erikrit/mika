export type MemoryType = 'FIXED' | 'EVOLUTIVE' | 'SENSITIVE';

export type PrivacyLevel = 'PUBLIC' | 'PRIVATE' | 'SENSITIVE';

export type ContextCategory =
  | 'LIFE'
  | 'WORK'
  | 'FINANCE'
  | 'PROJECT'
  | 'ROUTINE'
  | 'LEARNING'
  | 'RELATIONSHIP'
  | 'HEALTH'
  | 'EMOTIONAL'
  | 'MEMORY'
  | 'CUSTOM';

export type ConfidenceType = 'FACT' | 'INFERRED' | 'HYPOTHESIS';

export type RetentionType = 'PERMANENT' | 'LONG_TERM' | 'SHORT_TERM' | 'ARCHIVED';

export type MemoryAuditChannel = 'CHAT' | 'TELEGRAM' | 'ROUTINE';

export type ContextDocumentSource = 'import' | 'manual' | 'crud';

export interface ContextDocument {
  id: string;
  userId: string;
  title: string;
  category: ContextCategory;
  memoryType: MemoryType;
  privacyLevel: PrivacyLevel;
  source: ContextDocumentSource;
  enabledForRag: boolean;
  retentionType: RetentionType;
  currentVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export interface ContextDocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content: string;
  contentHash: string;
  createdAt: Date;
}

export interface MemoryUsageAudit {
  id: string;
  userId: string;
  chunkId: string;
  channel: MemoryAuditChannel;
  createdAt: Date;
}

export type RetrievalFilters = {
  memoryTypes?: MemoryType[];
  categories?: ContextCategory[];
  excludeDisabledRag?: boolean;
  minScore?: number;
};

export type MemoryHealthMetrics = {
  totalChunks: number;
  totalDocuments: number;
  byMemoryType: Record<MemoryType, number>;
  byPrivacyLevel: Record<PrivacyLevel, number>;
  duplicates: number;
  orphans: number;
  disabledForRag: number;
  archived: number;
};

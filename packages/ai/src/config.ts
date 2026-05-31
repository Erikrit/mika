export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  temperature: 0.7,
  maxTokens: 1000,
  timeoutMs: 30_000,
  embeddingTimeoutMs: 15_000,
  similarityThreshold: 0.7,
  maxMemoryTokens: 2000,
} as const;

export const FALLBACK_MESSAGE =
  'Estou com dificuldade agora, tente em alguns minutos';

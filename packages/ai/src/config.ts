export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  temperature: 0.7,
  /** Temperatura reduzida para chat com tools (anti-alucinação de mutações). */
  toolsTemperature: 0.5,
  maxTokens: 1000,
  timeoutMs: 30_000,
  embeddingTimeoutMs: 15_000,
  similarityThreshold: 0.65,
  sensitiveSimilarityThreshold: 0.75,
  maxMemoryTokens: 2000,
  maxFixedProfileChunks: 2,
} as const;

export const FALLBACK_MESSAGE =
  'Estou com dificuldade agora, tente em alguns minutos';

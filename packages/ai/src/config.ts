export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
  timeoutMs: 30_000,
} as const;

export const FALLBACK_MESSAGE =
  'Estou com dificuldade agora, tente em alguns minutos';

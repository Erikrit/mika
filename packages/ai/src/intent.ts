const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PRIORITY_INTENT_RE =
  /prioridad|prioridades|foco|principal|\btop\b/i;

export const PRIORITY_EXPANDED_QUERY =
  'prioridade foco objetivo principal semana';

export const FALLBACK_SIMILARITY_THRESHOLD = 0.55;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isPriorityIntent(query: string): boolean {
  return PRIORITY_INTENT_RE.test(query);
}

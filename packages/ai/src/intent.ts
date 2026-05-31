import type { ContextCategory, MemoryType, RetrievalFilters } from '@mika/shared';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PRIORITY_INTENT_RE =
  /prioridad|prioridades|foco|principal|\btop\b/i;

export const LIFE_INTENT_RE =
  /objetivo|vida|prop[oó]sito|valores|vis[aã]o|quem\s+sou|perfil/i;

export const FINANCE_INTENT_RE =
  /financ|dinheiro|invest|or[cç]amento|d[ií]vida|sal[aá]rio|gasto/i;

export const WORK_INTENT_RE =
  /trabalho|projeto|carreira|profissional|cliente|reuni[aã]o/i;

export const RELATIONSHIP_INTENT_RE =
  /fam[ií]lia|relacionamento|parceir|filho|m[aã]e|pai/i;

export const HEALTH_INTENT_RE =
  /sa[uú]de|exerc[ií]cio|sono|alimenta[cç][aã]o|m[eé]dico/i;

export const PRIORITY_EXPANDED_QUERY =
  'prioridade foco objetivo principal semana';

export const FALLBACK_SIMILARITY_THRESHOLD = 0.55;
export const SENSITIVE_SIMILARITY_THRESHOLD = 0.75;

export type QueryIntent = {
  categories: ContextCategory[];
  memoryTypes: MemoryType[];
  isSensitiveQuery: boolean;
};

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isPriorityIntent(query: string): boolean {
  return PRIORITY_INTENT_RE.test(query);
}

export function detectIntent(query: string): QueryIntent {
  const q = query.toLowerCase();
  const categories: ContextCategory[] = [];
  const memoryTypes: MemoryType[] = ['FIXED', 'EVOLUTIVE'];
  let isSensitiveQuery = false;

  if (LIFE_INTENT_RE.test(q)) categories.push('LIFE');
  if (FINANCE_INTENT_RE.test(q)) {
    categories.push('FINANCE');
    isSensitiveQuery = true;
  }
  if (WORK_INTENT_RE.test(q)) categories.push('WORK', 'PROJECT');
  if (RELATIONSHIP_INTENT_RE.test(q)) {
    categories.push('RELATIONSHIP');
    isSensitiveQuery = true;
  }
  if (HEALTH_INTENT_RE.test(q)) categories.push('HEALTH');
  if (isPriorityIntent(q)) {
    categories.push('LIFE', 'PROJECT', 'ROUTINE');
    memoryTypes.push('EVOLUTIVE');
  }

  if (isSensitiveQuery) {
    memoryTypes.push('SENSITIVE');
  }

  if (categories.length === 0) {
    return {
      categories: [],
      memoryTypes: ['FIXED', 'EVOLUTIVE', 'SENSITIVE'],
      isSensitiveQuery,
    };
  }

  return { categories, memoryTypes, isSensitiveQuery };
}

export function buildRetrievalFilters(intent: QueryIntent): RetrievalFilters {
  const minScore = intent.isSensitiveQuery
    ? SENSITIVE_SIMILARITY_THRESHOLD
    : undefined;

  return {
    memoryTypes: intent.memoryTypes,
    categories: intent.categories.length > 0 ? intent.categories : undefined,
    excludeDisabledRag: true,
    minScore,
  };
}

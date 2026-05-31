import type {
  ConfidenceType,
  ContextCategory,
  MemoryType,
  PrivacyLevel,
} from '@mika/shared';
import { parseMarkdownFrontmatter } from './chunk';

export type ClassificationResult = {
  memoryType: MemoryType;
  privacyLevel: PrivacyLevel;
  category: ContextCategory;
  confidenceType: ConfidenceType;
  confidenceScore: number;
  importance: number;
};

const FIXED_TITLE_PATTERNS =
  /objetivos?\s+de\s+vida|como\s+trabalhar|perfil\s+pessoal|vis[aã]o\s+de\s+futuro|valores|quem\s+sou/i;

const SENSITIVE_PATTERNS =
  /financeir|sal[aá]rio|d[ií]vida|investimento|fam[ií]lia|relacionamento|sa[uú]de\s+mental|terapia|diagn[oó]stico/i;

const CATEGORY_MAP: Record<string, ContextCategory> = {
  life: 'LIFE',
  vida: 'LIFE',
  work: 'WORK',
  trabalho: 'WORK',
  professional: 'WORK',
  finance: 'FINANCE',
  financial: 'FINANCE',
  financeiro: 'FINANCE',
  project: 'PROJECT',
  projeto: 'PROJECT',
  routine: 'ROUTINE',
  rotina: 'ROUTINE',
  learning: 'LEARNING',
  aprendizado: 'LEARNING',
  relationship: 'RELATIONSHIP',
  relacionamento: 'RELATIONSHIP',
  health: 'HEALTH',
  saude: 'HEALTH',
  emotional: 'EMOTIONAL',
  emocional: 'EMOTIONAL',
  memory: 'MEMORY',
  memoria: 'MEMORY',
};

function mapCategory(raw?: string): ContextCategory {
  if (!raw) return 'CUSTOM';
  const key = raw.trim().toLowerCase();
  return CATEGORY_MAP[key] ?? 'CUSTOM';
}

function inferFromCategory(category: ContextCategory): Partial<ClassificationResult> {
  if (category === 'FINANCE' || category === 'RELATIONSHIP' || category === 'EMOTIONAL') {
    return {
      memoryType: 'SENSITIVE',
      privacyLevel: 'SENSITIVE',
      importance: 4,
    };
  }
  if (category === 'LIFE') {
    return { memoryType: 'FIXED', privacyLevel: 'PRIVATE', importance: 5 };
  }
  return { memoryType: 'EVOLUTIVE', privacyLevel: 'PRIVATE', importance: 3 };
}

export function classifyDocumentHeuristic(input: {
  title: string;
  content: string;
  categoryHint?: ContextCategory;
}): ClassificationResult {
  const { frontmatter } = parseMarkdownFrontmatter(input.content);
  const title = input.title;
  const combined = `${title}\n${input.content.slice(0, 2000)}`;

  let category =
    input.categoryHint ??
    mapCategory(String(frontmatter.category ?? frontmatter.area ?? ''));

  let memoryType: MemoryType = 'EVOLUTIVE';
  let privacyLevel: PrivacyLevel = 'PRIVATE';
  let importance = 3;

  if (frontmatter.memoryType === 'FIXED' || frontmatter.layer === 'fixed') {
    memoryType = 'FIXED';
    importance = 5;
  } else if (
    frontmatter.memoryType === 'SENSITIVE' ||
    frontmatter.layer === 'sensitive' ||
    frontmatter.privacy === 'sensitive'
  ) {
    memoryType = 'SENSITIVE';
    privacyLevel = 'SENSITIVE';
    importance = 4;
  } else if (FIXED_TITLE_PATTERNS.test(title)) {
    memoryType = 'FIXED';
    category = category === 'CUSTOM' ? 'LIFE' : category;
    importance = 5;
  } else if (SENSITIVE_PATTERNS.test(combined)) {
    memoryType = 'SENSITIVE';
    privacyLevel = 'SENSITIVE';
    importance = 4;
  } else {
    const inferred = inferFromCategory(category);
    memoryType = inferred.memoryType ?? memoryType;
    privacyLevel = inferred.privacyLevel ?? privacyLevel;
    importance = inferred.importance ?? importance;
  }

  if (frontmatter.privacy === 'public') privacyLevel = 'PUBLIC';
  if (frontmatter.privacy === 'private') privacyLevel = 'PRIVATE';

  return {
    memoryType,
    privacyLevel,
    category,
    confidenceType: 'FACT',
    confidenceScore: 1.0,
    importance,
  };
}

export async function classifyDocument(
  input: Parameters<typeof classifyDocumentHeuristic>[0],
): Promise<ClassificationResult> {
  const heuristic = classifyDocumentHeuristic(input);

  if (process.env.CLASSIFY_WITH_LLM !== 'true') {
    return heuristic;
  }

  // LLM fallback reserved for ambiguous cases — heurística suficiente no M4
  return {
    ...heuristic,
    confidenceType: 'INFERRED',
    confidenceScore: 0.6,
  };
}

export function classifyCrudSource(): Pick<
  ClassificationResult,
  'memoryType' | 'privacyLevel' | 'confidenceType' | 'confidenceScore' | 'importance'
> {
  return {
    memoryType: 'EVOLUTIVE',
    privacyLevel: 'PRIVATE',
    confidenceType: 'FACT',
    confidenceScore: 1.0,
    importance: 3,
  };
}

export function classifyImportSource(): Pick<
  ClassificationResult,
  'confidenceType' | 'confidenceScore'
> {
  return { confidenceType: 'FACT', confidenceScore: 1.0 };
}

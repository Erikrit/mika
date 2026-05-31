import type { RetrievedChunk } from '@mika/shared';

const RECENCY_DECAY_DAYS = 30;
const LIFE_AREA_BOOST = 0.15;

export type HybridRetrieveInput = {
  vectorResults: RetrievedChunk[];
  textResults: RetrievedChunk[];
  lifeAreaId?: string;
  topK?: number;
};

function recencyBoost(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - ageDays / RECENCY_DECAY_DAYS) * 0.2;
}

function scoreChunk(chunk: RetrievedChunk, lifeAreaId?: string): number {
  const vector = chunk.vectorScore ?? 0;
  const text = chunk.textScore ?? 0;
  const base = Math.max(vector, text * 0.85);
  const recency = recencyBoost(chunk.createdAt);
  const area =
    lifeAreaId && chunk.lifeAreaId === lifeAreaId ? LIFE_AREA_BOOST : 0;
  return base + recency + area;
}

export function hybridRetrieve(input: HybridRetrieveInput): RetrievedChunk[] {
  const topK = input.topK ?? 5;
  const byHash = new Map<string, RetrievedChunk>();

  for (const chunk of [...input.vectorResults, ...input.textResults]) {
    const existing = byHash.get(chunk.contentHash);
    if (!existing) {
      byHash.set(chunk.contentHash, { ...chunk });
      continue;
    }
    byHash.set(chunk.contentHash, {
      ...existing,
      vectorScore: Math.max(existing.vectorScore ?? 0, chunk.vectorScore ?? 0),
      textScore: Math.max(existing.textScore ?? 0, chunk.textScore ?? 0),
    });
  }

  return [...byHash.values()]
    .map((chunk) => ({ ...chunk, finalScore: scoreChunk(chunk, input.lifeAreaId) }))
    .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
    .slice(0, topK);
}

const MAX_MEMORY_CHARS = 8000;

export function formatMemoryContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '';

  const lines = ['Memória recuperada (use quando relevante):'];
  let totalChars = lines[0].length;

  for (const chunk of chunks) {
    const label = chunk.lifeAreaLabel ?? chunk.sourceType;
    const date = chunk.createdAt.toLocaleDateString('pt-BR');
    const header = `[${label} · ${date}]`;
    const block = `${header}\n${chunk.content}`;
    if (totalChars + block.length > MAX_MEMORY_CHARS) break;
    lines.push(block);
    totalChars += block.length;
  }

  return lines.join('\n\n');
}

export const NO_MEMORY_HINT =
  'Nenhum trecho relevante foi encontrado na memória para esta pergunta.';

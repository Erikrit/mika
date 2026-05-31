import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { AI_CONFIG } from './config';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('embedding timeout')), ms),
    ),
  ]);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const attempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { embedding } = await withTimeout(
        embed({
          model: openai.embedding(AI_CONFIG.embeddingModel),
          value: text,
        }),
        AI_CONFIG.embeddingTimeoutMs,
      );
      return embedding;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('embedding failed');
}

export function embeddingToVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

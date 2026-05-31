import type { RetrievedChunk } from '@mika/shared';
import { formatMemoryContext } from './retrieve';

export function buildFixedProfileContext(chunks: RetrievedChunk[]): string {
  const fixed = chunks.filter((c) => c.memoryType === 'FIXED');
  if (fixed.length === 0) return '';
  return formatMemoryContext(fixed);
}

import { computeContentHash, chunkMarkdown } from './chunk';
import { hybridRetrieve } from './retrieve';
import type { RetrievedChunk } from '@mika/shared';

describe('chunk utilities', () => {
  it('skips content shorter than 10 chars', () => {
    expect(chunkMarkdown('curto')).toEqual([]);
  });

  it('splits markdown by headings', () => {
    const content =
      '## Finanças\nInvestimentos em renda fixa.\n\n## Viagem\nJoão Pessoa em dezembro.';
    const chunks = chunkMarkdown(content);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks.some((c) => c.includes('João Pessoa'))).toBe(true);
  });

  it('computes stable content hash', () => {
    const h1 = computeContentHash('u1', 'PROJECT', 'p1', 'Hello World');
    const h2 = computeContentHash('u1', 'PROJECT', 'p1', 'hello   world');
    expect(h1).toBe(h2);
  });
});

describe('hybridRetrieve', () => {
  const base: RetrievedChunk = {
    id: '1',
    content: 'Projeto João Pessoa',
    sourceType: 'PROJECT',
    sourceId: 'p1',
    lifeAreaId: 'la1',
    metadata: {},
    createdAt: new Date(),
    contentHash: 'abc',
  };

  it('deduplicates by contentHash and merges scores', () => {
    const results = hybridRetrieve({
      vectorResults: [{ ...base, vectorScore: 0.85 }],
      textResults: [{ ...base, textScore: 0.5 }],
      topK: 5,
    });
    expect(results).toHaveLength(1);
    expect(results[0].vectorScore).toBe(0.85);
    expect(results[0].textScore).toBe(0.5);
  });

  it('boosts matching lifeArea', () => {
    const travel: RetrievedChunk = {
      ...base,
      id: '2',
      contentHash: 'def',
      lifeAreaId: 'travel',
      vectorScore: 0.8,
    };
    const health: RetrievedChunk = {
      ...base,
      id: '3',
      contentHash: 'ghi',
      lifeAreaId: 'health',
      vectorScore: 0.79,
    };
    const results = hybridRetrieve({
      vectorResults: [travel, health],
      textResults: [],
      lifeAreaId: 'health',
      topK: 2,
    });
    expect(results[0].lifeAreaId).toBe('health');
  });
});

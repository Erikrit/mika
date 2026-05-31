import { classifyDocumentHeuristic } from './classify';
import { detectIntent, buildRetrievalFilters } from './intent';

describe('classifyDocumentHeuristic', () => {
  it('classifica Objetivos de Vida como FIXED', () => {
    const result = classifyDocumentHeuristic({
      title: 'Objetivos de Vida',
      content: '# Objetivos\n\nSer saudável e crescer profissionalmente.',
    });
    expect(result.memoryType).toBe('FIXED');
    expect(result.category).toBe('LIFE');
  });

  it('classifica conteúdo financeiro como SENSITIVE', () => {
    const result = classifyDocumentHeuristic({
      title: 'Planejamento',
      content: 'Meu salário e investimentos em ações.',
      categoryHint: 'FINANCE',
    });
    expect(result.memoryType).toBe('SENSITIVE');
    expect(result.privacyLevel).toBe('SENSITIVE');
  });
});

describe('detectIntent + buildRetrievalFilters', () => {
  it('pergunta financeira inclui FINANCE e SENSITIVE', () => {
    const intent = detectIntent('como está meu orçamento financeiro?');
    expect(intent.categories).toContain('FINANCE');
    expect(intent.memoryTypes).toContain('SENSITIVE');
    const filters = buildRetrievalFilters(intent);
    expect(filters.minScore).toBe(0.75);
    expect(filters.excludeDisabledRag).toBe(true);
  });

  it('pergunta de prioridades não exige categoria específica', () => {
    const intent = detectIntent('quais são minhas prioridades?');
    expect(intent.categories.length).toBeGreaterThan(0);
  });
});

import type { EveningReflectionData } from '../../routines/types';

export const EVENING_REFLECTION_SYSTEM = `Você é Mika. Gere uma reflexão noturna curta em português brasileiro.

Inclua:
- Resumo do que foi concluído hoje
- Menção breve do que ficou pendente (sem culpa)
- Termine com: "Como foi seu dia? O que aprendeu?"

Tom: acolhedor, reflexivo. Máximo 150 palavras.`;

export function formatEveningReflectionUserPrompt(data: EveningReflectionData): string {
  return JSON.stringify(data, null, 2);
}

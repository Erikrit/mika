import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  ProjectDraftSchema,
  type CreateProjectDraftDto,
  type ProjectDraftDto,
} from '@mika/shared';
import { AI_CONFIG } from './config';

export type GenerateProjectDraftInput = CreateProjectDraftDto & {
  availableLifeAreas: Array<{ slug: string; label: string }>;
};

function buildPrompt(input: GenerateProjectDraftInput) {
  const lifeAreas = input.availableLifeAreas
    .map((area) => `- ${area.slug}: ${area.label}`)
    .join('\n');

  return `Voce e a Mika, uma assistente pessoal em pt-BR. Transforme a entrada do usuario em um rascunho de projeto pratico e revisavel.

Regras:
- Responda apenas no objeto estruturado solicitado.
- Use titulos curtos, claros e acionaveis.
- Gere no maximo 12 tarefas iniciais.
- Nao invente datas exatas quando nao houver indicio claro.
- Quando inferir algo, registre em warnings.
- Use uma das areas disponiveis em lifeAreaSlug quando fizer sentido.
- Nao crie eventos sem data/hora clara.
- Marcos sao resultados intermediarios, nao tarefas soltas.

Areas disponiveis:
${lifeAreas || '- nenhuma area informada'}

Prompt do usuario:
${input.prompt?.trim() || '(sem prompt)'}

Arquivo:
${input.file ? `Nome: ${input.file.name}\nConteudo:\n${input.file.content}` : '(sem arquivo)'}`;
}

export async function generateProjectDraft(
  input: GenerateProjectDraftInput,
): Promise<ProjectDraftDto> {
  const { object } = await generateObject({
    model: openai(AI_CONFIG.model),
    temperature: 0.3,
    maxTokens: 1800,
    schema: ProjectDraftSchema,
    providerOptions: {
      openai: { store: false },
    },
    prompt: buildPrompt(input),
  });

  return object;
}

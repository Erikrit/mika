import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { AI_CONFIG, FALLBACK_MESSAGE } from './config';
import { SYSTEM_PROMPT } from './prompts/system';
import { buildChatTools } from './tools/chat-tools';
import type { ChatToolExecutors } from './tools/types';
import type { ChatMessage } from './generate-reply';

export type GenerateReplyWithToolsInput = {
  channel: 'web' | 'telegram';
  context: string;
  history: ChatMessage[];
  message: string;
  executors: ChatToolExecutors;
};

export type GenerateReplyWithToolsResult = {
  reply: string;
  latencyMs: number;
  status: 'success' | 'fallback';
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

function channelHint(channel: 'web' | 'telegram'): string {
  return channel === 'telegram'
    ? '\n\nResponda de forma concisa (máximo 3 parágrafos curtos).'
    : '\n\nResponda de forma clara e estruturada quando apropriado.';
}

function buildMessages(
  input: GenerateReplyWithToolsInput,
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  return [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}${channelHint(input.channel)}

IMPORTANTE: Use as ferramentas disponíveis para consultar dados reais antes de responder sobre tarefas, eventos, finanças ou memória. Nunca invente datas ou compromissos. Se a ferramenta não retornar dados, diga honestamente que não encontrou.

MUTAÇÕES DE TAREFAS:
- Deduplicação obrigatória (antes de criar):
  - Antes de qualquer create_task, SEMPRE chame get_tasks (ex.: { limit: 50 }) para verificar duplicatas.
  - Considere duplicata quando o título normalizado for igual ao de uma tarefa existente:
    - normalização: trim; colapsar espaços internos; comparar case-insensitive.
  - Se já existir, NÃO chame create_task. Responda: "Essa tarefa já existe (id X). Quer que eu ajuste prazo/prioridade?".
  - Se o usuário pediu "crie as tarefas acima" / "gere as tarefas com base na sugestão" e todas já existirem, responda listando as existentes e deixe explícito: "Não criei duplicatas.".
- Rotina/plano NÃO vira tarefa automaticamente:
  - Itens como "Rotina diária" (acordar, trabalhar, academia, meditar, etc.) são sugestões de agenda, não tarefas.
  - Só crie tarefas quando o usuário pedir explicitamente para transformar itens em tarefas (ex.: "crie tarefas", "transforme em tarefas") ou fornecer uma lista de tarefas para criar.
- Criar: só afirmar criação após create_task retornar success: true com task.id; uma chamada por tarefa; citar título e id.
- Atualizar: chamar get_tasks se não tiver id; depois update_task; confirmar só com success: true.
- Excluir: sempre get_tasks → delete_task por taskId; nunca create_task para "excluir/deletar"; confirmar quantidade excluída.
- Proibido: inventar horários, ids ou sucesso sem tool de mutação.

--- Contexto leve ---
${input.context}`,
    },
    ...input.history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: input.message },
  ];
}

export async function generateReplyWithTools(
  input: GenerateReplyWithToolsInput,
): Promise<GenerateReplyWithToolsResult> {
  const tools = buildChatTools(input.executors);
  const messages = buildMessages(input);
  const attempts = 2;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const start = Date.now();
      const { text } = await withTimeout(
        generateText({
          model: openai(AI_CONFIG.model),
          temperature: AI_CONFIG.toolsTemperature,
          maxTokens: AI_CONFIG.maxTokens,
          maxSteps: 5,
          tools,
          providerOptions: {
            openai: { store: false },
          },
          messages,
        }),
        AI_CONFIG.timeoutMs,
      );
      return { reply: text, latencyMs: Date.now() - start, status: 'success' };
    } catch {
      if (attempt === attempts) {
        return {
          reply: FALLBACK_MESSAGE,
          latencyMs: AI_CONFIG.timeoutMs,
          status: 'fallback',
        };
      }
    }
  }

  return {
    reply: FALLBACK_MESSAGE,
    latencyMs: AI_CONFIG.timeoutMs,
    status: 'fallback',
  };
}

export type StreamReplyWithToolsInput = GenerateReplyWithToolsInput;

export function streamReplyWithTools(input: StreamReplyWithToolsInput) {
  const tools = buildChatTools(input.executors);
  const messages = buildMessages(input);

  return streamText({
    model: openai(AI_CONFIG.model),
    temperature: AI_CONFIG.toolsTemperature,
    maxTokens: AI_CONFIG.maxTokens,
    maxSteps: 5,
    tools,
    providerOptions: {
      openai: { store: false },
    },
    messages,
  });
}

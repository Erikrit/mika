import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { AI_CONFIG, FALLBACK_MESSAGE } from './config';
import { SYSTEM_PROMPT } from './prompts/system';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GenerateReplyInput = {
  userId: string;
  channel: 'web' | 'telegram';
  context: string;
  history: ChatMessage[];
  message: string;
};

export type GenerateReplyResult = {
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

async function callOpenAI(
  input: GenerateReplyInput,
): Promise<{ text: string; latencyMs: number }> {
  const start = Date.now();

  const channelHint =
    input.channel === 'telegram'
      ? '\n\nResponda de forma concisa (máximo 3 parágrafos curtos).'
      : '\n\nResponda de forma clara e estruturada quando apropriado.';

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    temperature: AI_CONFIG.temperature,
    maxTokens: AI_CONFIG.maxTokens,
    providerOptions: {
      openai: { store: false },
    },
    messages: [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}${channelHint}\n\n--- Contexto do usuário ---\n${input.context}`,
      },
      ...input.history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: input.message },
    ],
  });

  return { text, latencyMs: Date.now() - start };
}

export async function generateReply(
  input: GenerateReplyInput,
): Promise<GenerateReplyResult> {
  const attempts = 2;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { text, latencyMs } = await withTimeout(
        callOpenAI(input),
        AI_CONFIG.timeoutMs,
      );
      return { reply: text, latencyMs, status: 'success' };
    } catch {
      if (attempt === attempts) {
        return { reply: FALLBACK_MESSAGE, latencyMs: AI_CONFIG.timeoutMs, status: 'fallback' };
      }
    }
  }

  return { reply: FALLBACK_MESSAGE, latencyMs: AI_CONFIG.timeoutMs, status: 'fallback' };
}

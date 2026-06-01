import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { AI_CONFIG } from './config';
import type { ChatMessage } from './generate-reply';

export async function summarizeOlderMessages(
  messages: ChatMessage[],
): Promise<string> {
  if (messages.length === 0) return '';

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Usuário' : 'Mika'}: ${m.content}`)
    .join('\n');

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    temperature: 0.3,
    maxTokens: 400,
    providerOptions: {
      openai: { store: false },
    },
    messages: [
      {
        role: 'system',
        content:
          'Resuma a conversa anterior em português brasileiro, preservando fatos, decisões e pendências mencionadas. Máximo 200 palavras.',
      },
      { role: 'user', content: transcript },
    ],
  });

  return text;
}

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { AI_CONFIG } from './config';
import type {
  DailySummaryData,
  EveningReflectionData,
  GenerateRoutineResult,
  MiddayCheckData,
  RoutineType,
  WeeklyReviewData,
} from './routines/types';
import {
  DAILY_SUMMARY_SYSTEM,
  formatDailySummaryUserPrompt,
} from './prompts/routines/daily-summary';
import {
  WEEKLY_REVIEW_SYSTEM,
  formatWeeklyReviewUserPrompt,
} from './prompts/routines/weekly-review';
import {
  MIDDAY_CHECK_SYSTEM,
  formatMiddayCheckUserPrompt,
} from './prompts/routines/midday-check';
import {
  EVENING_REFLECTION_SYSTEM,
  formatEveningReflectionUserPrompt,
} from './prompts/routines/evening-reflection';
import {
  buildDailySummaryFallback,
  buildWeeklyReviewFallback,
  buildMiddayCheckFallback,
  buildEveningReflectionFallback,
} from './templates/fallback';

const ROUTINE_CONFIG: Record<
  RoutineType,
  { maxTokens: number; system: string; maxWords: number }
> = {
  DAILY_SUMMARY: { maxTokens: 600, system: DAILY_SUMMARY_SYSTEM, maxWords: 300 },
  WEEKLY_REVIEW: { maxTokens: 900, system: WEEKLY_REVIEW_SYSTEM, maxWords: 500 },
  MIDDAY_CHECK: { maxTokens: 300, system: MIDDAY_CHECK_SYSTEM, maxWords: 150 },
  EVENING_REFLECTION: { maxTokens: 300, system: EVENING_REFLECTION_SYSTEM, maxWords: 150 },
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms),
    ),
  ]);
}

function getFallback(
  type: RoutineType,
  data: DailySummaryData | WeeklyReviewData | MiddayCheckData | EveningReflectionData,
): string {
  switch (type) {
    case 'DAILY_SUMMARY':
      return buildDailySummaryFallback(data as DailySummaryData);
    case 'WEEKLY_REVIEW':
      return buildWeeklyReviewFallback(data as WeeklyReviewData);
    case 'MIDDAY_CHECK':
      return buildMiddayCheckFallback(data as MiddayCheckData);
    case 'EVENING_REFLECTION':
      return buildEveningReflectionFallback(data as EveningReflectionData);
  }
}

function formatUserPrompt(
  type: RoutineType,
  data: DailySummaryData | WeeklyReviewData | MiddayCheckData | EveningReflectionData,
): string {
  switch (type) {
    case 'DAILY_SUMMARY':
      return formatDailySummaryUserPrompt(data as DailySummaryData);
    case 'WEEKLY_REVIEW':
      return formatWeeklyReviewUserPrompt(data as WeeklyReviewData);
    case 'MIDDAY_CHECK':
      return formatMiddayCheckUserPrompt(data as MiddayCheckData);
    case 'EVENING_REFLECTION':
      return formatEveningReflectionUserPrompt(data as EveningReflectionData);
  }
}

export async function generateRoutine(
  type: RoutineType,
  data: DailySummaryData | WeeklyReviewData | MiddayCheckData | EveningReflectionData,
  options?: { fixedProfile?: string },
): Promise<GenerateRoutineResult> {
  const config = ROUTINE_CONFIG[type];
  const start = Date.now();
  const attempts = 2;
  let userContent = formatUserPrompt(type, data);

  if (options?.fixedProfile?.trim()) {
    userContent += `\n\n--- Perfil do usuário (adapte tom e estilo) ---\n${options.fixedProfile.trim()}`;
  }

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { text } = await withTimeout(
        generateText({
          model: openai(AI_CONFIG.model),
          temperature: 0.6,
          maxTokens: config.maxTokens,
          providerOptions: {
            openai: { store: false },
          },
          messages: [
            { role: 'system', content: config.system },
            { role: 'user', content: userContent },
          ],
        }),
        AI_CONFIG.timeoutMs,
      );

      return {
        content: text.trim(),
        status: 'success',
        latencyMs: Date.now() - start,
      };
    } catch {
      if (attempt === attempts) {
        return {
          content: getFallback(type, data),
          status: 'fallback',
          latencyMs: Date.now() - start,
        };
      }
    }
  }

  return {
    content: getFallback(type, data),
    status: 'fallback',
    latencyMs: Date.now() - start,
  };
}

export type {
  DailySummaryData,
  WeeklyReviewData,
  MiddayCheckData,
  EveningReflectionData,
  RoutineType,
  GenerateRoutineResult,
} from './routines/types';

import type { WeeklyReviewData } from '../../routines/types';

export const WEEKLY_REVIEW_SYSTEM = `Você é Mika, assistente pessoal. Gere uma revisão semanal em português brasileiro.

Inclua seções:
1. Concluídos esta semana (celebrar, mesmo que poucos)
2. Atrasados (listar com dias de atraso)
3. Perderam prioridade (sem interação >7 dias)
4. Eventos importantes da próxima semana (se houver)
5. Sugestão de foco para a próxima semana

Tom: honesto, construtivo, sem culpa. Máximo 500 palavras.`;

export function formatWeeklyReviewUserPrompt(data: WeeklyReviewData): string {
  return JSON.stringify(
    {
      weekStart: data.weekStart,
      weekEnd: data.weekEnd,
      completedTasks: data.completedTasks,
      overdueTasks: data.overdueTasks,
      neglectedItems: data.neglectedItems,
      nextWeekEvents: data.nextWeekEvents.map((e) => ({
        title: e.title,
        startsAt: e.startsAt.toISOString(),
      })),
      completedCount: data.completedCount,
    },
    null,
    2,
  );
}

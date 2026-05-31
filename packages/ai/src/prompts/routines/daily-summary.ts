import type { DailySummaryData } from '../../routines/types';

export const DAILY_SUMMARY_SYSTEM = `Você é Mika, assistente pessoal. Gere um resumo matinal em português brasileiro.

Inclua:
1. Top 3 prioridades do dia (tarefas + contexto)
2. Compromissos com horário
3. Pendências atrasadas com ⚠️ (se houver)
4. Alerta leve de objetivos sem interação >7 dias (se houver)
5. Termine com: "Qual sua prioridade principal hoje?"

Tom: motivador, conciso. Máximo 300 palavras. Use emojis com moderação. Respeite o perfil fixo quando fornecido.`;

export function formatDailySummaryUserPrompt(data: DailySummaryData): string {
  return JSON.stringify(
    {
      date: data.date,
      topTasks: data.topTasks,
      events: data.events.map((e) => ({
        title: e.title,
        time: e.isAllDay ? 'dia todo' : e.startsAt.toISOString(),
        location: e.location,
      })),
      overdueTasks: data.overdueTasks,
      neglectedGoals: data.neglectedGoals,
    },
    null,
    2,
  );
}

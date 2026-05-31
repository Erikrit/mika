import type {
  DailySummaryData,
  EveningReflectionData,
  MiddayCheckData,
  WeeklyReviewData,
} from '../routines/types';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export function buildDailySummaryFallback(data: DailySummaryData): string {
  const lines: string[] = [`📋 *Resumo — ${data.date}*`, ''];

  if (data.topTasks.length === 0 && data.events.length === 0 && data.overdueTasks.length === 0) {
    lines.push('✨ Dia livre! Aproveite ou adiante algo.');
  } else {
    if (data.topTasks.length > 0) {
      lines.push('*Prioridades:*');
      data.topTasks.forEach((t, i) => {
        const flag = t.overdue ? ' ⚠️' : '';
        lines.push(`${i + 1}. ${t.title}${flag}`);
      });
      lines.push('');
    }

    if (data.events.length > 0) {
      lines.push('*Compromissos:*');
      for (const e of data.events) {
        const time = e.isAllDay ? 'dia todo' : formatTime(e.startsAt);
        lines.push(`• ${time} — ${e.title}`);
      }
      lines.push('');
    }

    if (data.overdueTasks.length > 0) {
      lines.push(`⚠️ *${data.overdueTasks.length} tarefa(s) atrasada(s):*`);
      for (const t of data.overdueTasks) {
        lines.push(`• ${t.title} (${t.daysOverdue ?? 0}d)`);
      }
      lines.push('');
    }

    if (data.neglectedGoals.length > 0) {
      lines.push('*Objetivos sem interação recente:*');
      for (const g of data.neglectedGoals) {
        lines.push(`• ${g.title} (${g.daysSinceUpdate}d)`);
      }
      lines.push('');
    }
  }

  lines.push('Qual sua prioridade principal hoje?');
  return lines.join('\n');
}

export function buildWeeklyReviewFallback(data: WeeklyReviewData): string {
  const lines: string[] = [
    `📊 *Revisão semanal — ${data.weekStart} a ${data.weekEnd}*`,
    '',
  ];

  if (data.completedCount === 0 && data.overdueTasks.length === 0) {
    lines.push('Semana tranquila. Que tal definir um foco para a próxima?');
  } else {
    lines.push(`*Concluídos (${data.completedCount}):*`);
    if (data.completedTasks.length === 0) {
      lines.push('Nenhuma tarefa concluída esta semana.');
    } else {
      for (const t of data.completedTasks.slice(0, 10)) {
        lines.push(`✅ ${t.title}`);
      }
    }
    lines.push('');

    if (data.overdueTasks.length > 0) {
      lines.push('*Atrasados:*');
      for (const t of data.overdueTasks) {
        lines.push(`⚠️ ${t.title} (${t.daysOverdue ?? 0}d)`);
      }
      lines.push('');
    }

    if (data.neglectedItems.length > 0) {
      lines.push('*Perderam prioridade:*');
      for (const item of data.neglectedItems) {
        lines.push(`• [${item.type}] ${item.title} (${item.daysSinceUpdate}d)`);
      }
      lines.push('');
    }

    if (data.nextWeekEvents.length > 0) {
      lines.push('*Próxima semana:*');
      for (const e of data.nextWeekEvents.slice(0, 5)) {
        lines.push(`• ${formatDate(e.startsAt)} — ${e.title}`);
      }
    }
  }

  return lines.join('\n');
}

export function buildMiddayCheckFallback(data: MiddayCheckData): string {
  const lines: string[] = [`☀️ *Check-in meio-dia — ${data.date}*`, ''];

  if (data.morningPriority) {
    lines.push(`Prioridade da manhã: _${data.morningPriority}_`, '');
  }

  lines.push(`Concluídas hoje: ${data.completedTodayCount}`);

  if (data.pendingTasks.length > 0) {
    lines.push('', '*Ainda pendente:*');
    for (const t of data.pendingTasks.slice(0, 5)) {
      lines.push(`• ${t.title}`);
    }
  }

  lines.push('', 'Como está o progresso até agora?');
  return lines.join('\n');
}

export function buildEveningReflectionFallback(data: EveningReflectionData): string {
  const lines: string[] = [`🌙 *Reflexão noturna — ${data.date}*`, ''];

  if (data.completedTasks.length > 0) {
    lines.push(`*Concluído hoje (${data.completedTasks.length}):*`);
    for (const t of data.completedTasks.slice(0, 8)) {
      lines.push(`✅ ${t.title}`);
    }
  } else {
    lines.push('Nenhuma tarefa concluída hoje.');
  }

  if (data.pendingTasks.length > 0) {
    lines.push('', `*Pendente: ${data.pendingTasks.length} tarefa(s)*`);
  }

  lines.push('', 'Como foi seu dia? O que aprendeu?');
  return lines.join('\n');
}

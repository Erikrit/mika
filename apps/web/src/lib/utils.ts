import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = 'pt-BR') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(date: Date | string, locale = 'pt-BR') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export const PRIORITY_CONFIG = {
  1: { label: 'Urgente', color: 'bg-critical', textColor: 'text-critical', bgLight: 'bg-critical/10' },
  2: { label: 'Alta', color: 'bg-attention', textColor: 'text-attention', bgLight: 'bg-attention/10' },
  3: { label: 'Média', color: 'bg-attention/70', textColor: 'text-attention', bgLight: 'bg-attention/10' },
  4: { label: 'Baixa', color: 'bg-accent', textColor: 'text-accent', bgLight: 'bg-accent/10' },
  5: { label: 'Opcional', color: 'bg-text-tertiary', textColor: 'text-text-tertiary', bgLight: 'bg-text-tertiary/10' },
} as const;

export const STATUS_CONFIG = {
  todo: { label: 'A fazer', color: 'bg-text-tertiary/10 text-text-secondary' },
  in_progress: { label: 'Em andamento', color: 'bg-accent/10 text-accent' },
  done: { label: 'Concluído', color: 'bg-progress/10 text-progress' },
  cancelled: { label: 'Cancelado', color: 'bg-critical/10 text-critical' },
} as const;

export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] ?? 'você';
  if (hour < 12) return `Bom dia, ${firstName}.`;
  if (hour < 18) return `Boa tarde, ${firstName}.`;
  return `Boa noite, ${firstName}.`;
}

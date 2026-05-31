import type { LifeAreaSlug } from '../types/index.js';

export const LIFE_AREA_DEFAULTS: Array<{ slug: LifeAreaSlug; label: string; color: string; icon: string }> = [
  { slug: 'professional', label: 'Profissional', color: '#3B82F6', icon: '💼' },
  { slug: 'financial', label: 'Financeiro', color: '#10B981', icon: '💰' },
  { slug: 'family', label: 'Familiar', color: '#F59E0B', icon: '🏠' },
  { slug: 'health', label: 'Saúde', color: '#EF4444', icon: '❤️' },
  { slug: 'travel', label: 'Viagens', color: '#8B5CF6', icon: '✈️' },
];

export const TASK_PRIORITY_LABELS: Record<number, string> = {
  1: 'Urgente',
  2: 'Alta',
  3: 'Média',
  4: 'Baixa',
  5: 'Opcional',
};

export const ENERGY_LEVEL_LABELS = {
  low: 'Baixa energia',
  medium: 'Energia média',
  high: 'Alta energia',
} as const;

export const GOAL_HORIZON_LABELS = {
  short: 'Curto prazo',
  medium: 'Médio prazo',
  long: 'Longo prazo',
} as const;

export const API_ROUTES = {
  health: '/health',
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  lifeAreas: '/life-areas',
  tasks: '/tasks',
  projects: '/projects',
  goals: '/goals',
  events: '/events',
  reflections: '/reflections',
  financeGoals: '/finance-goals',
  dashboard: '/dashboard/today',
  telegram: '/telegram/webhook',
} as const;

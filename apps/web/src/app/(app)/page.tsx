'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { dashboardApi, projectsApi, routinesApi } from '@/lib/api-client';
import { formatTime, getGreeting, PRIORITY_CONFIG } from '@/lib/utils';
import { MikaCard, MikaCardContent, MikaCardHeader, MikaCardTitle } from '@/components/ui/mika-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  FolderOpen,
  Lightbulb,
  Plus,
  TrendingUp,
} from 'lucide-react';

const WEEKLY_PROGRESS = 78;

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: dashboardApi.getToday,
    refetchInterval: 60000,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['routines', 'latest', 'DAILY_SUMMARY'],
    queryFn: () => routinesApi.getLatest('DAILY_SUMMARY'),
    refetchInterval: 300000,
  });

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const priorityTasks = data?.tasks.filter((t) => t.priority <= 2) ?? [];
  const activeProjects = Array.isArray(projects)
    ? projects.filter((p: { status?: string }) => p.status === 'ACTIVE' || p.status === 'PAUSED')
    : [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <MikaCard className="border-critical/30 bg-critical/5">
        <div className="flex items-center gap-3 text-critical">
          <AlertTriangle className="h-5 w-5" />
          <span>Erro ao carregar dashboard. Tente novamente.</span>
        </div>
      </MikaCard>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{getGreeting(user?.name)}</h1>
        <p className="mt-1 capitalize text-text-tertiary">{today}</p>
      </div>

      <MikaCard>
        <MikaCardHeader>
          <MikaCardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-insight" />
            Resumo de hoje
          </MikaCardTitle>
        </MikaCardHeader>
        <MikaCardContent>
          {dailySummary?.content ? (
            <p className="whitespace-pre-wrap text-sm text-text-secondary">{dailySummary.content}</p>
          ) : (
            <p className="text-sm text-text-tertiary">Resumo será gerado às 07:00</p>
          )}
        </MikaCardContent>
      </MikaCard>

      <MikaCard>
        <MikaCardHeader>
          <MikaCardTitle>Hoje você possui</MikaCardTitle>
        </MikaCardHeader>
        <MikaCardContent>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-accent" />
              {priorityTasks.length} tarefa{priorityTasks.length !== 1 ? 's' : ''} prioritária{priorityTasks.length !== 1 ? 's' : ''}
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-progress" />
              1 meta financeira em andamento
            </li>
            <li className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-insight" />
              {activeProjects.length > 0
                ? `${activeProjects.length} projeto${activeProjects.length !== 1 ? 's' : ''} aguardando ação`
                : 'Nenhum projeto pendente'}
            </li>
          </ul>
        </MikaCardContent>
      </MikaCard>

      <MikaCard>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">Seu progresso semanal</p>
            <span className="text-sm font-bold text-progress">{WEEKLY_PROGRESS}%</span>
          </div>
          <Progress value={WEEKLY_PROGRESS} className="h-2" />
        </div>
      </MikaCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MikaCard>
          <MikaCardHeader className="flex flex-row items-center justify-between pb-4">
            <MikaCardTitle className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-accent" />
              Tarefas prioritárias
            </MikaCardTitle>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-xs text-accent transition-colors duration-200 hover:text-accent/80"
            >
              <Plus className="h-3 w-3" />
              Ver todas
            </Link>
          </MikaCardHeader>
          <MikaCardContent>
            {priorityTasks.length === 0 ? (
              <EmptyState message="Nenhuma tarefa prioritária hoje!" action={{ label: 'Criar tarefa', href: '/tasks' }} />
            ) : (
              <ul className="space-y-2">
                {priorityTasks.map((task) => {
                  const p = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
                  return (
                    <li
                      key={task.id}
                      className="group flex items-start gap-3 rounded-lg p-3 transition-colors duration-200 hover:bg-surface"
                    >
                      <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${p?.color ?? 'bg-text-tertiary'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text-primary">{task.title}</p>
                        {task.dueAt && (
                          <p className="mt-0.5 text-xs text-text-tertiary">
                            {new Date(task.dueAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p?.bgLight ?? ''} ${p?.textColor ?? ''}`}>
                        {p?.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </MikaCardContent>
        </MikaCard>

        <MikaCard>
          <MikaCardHeader className="flex flex-row items-center justify-between pb-4">
            <MikaCardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Compromissos do dia
            </MikaCardTitle>
            <Link
              href="/events"
              className="flex items-center gap-1 text-xs text-accent transition-colors duration-200 hover:text-accent/80"
            >
              <Plus className="h-3 w-3" />
              Novo
            </Link>
          </MikaCardHeader>
          <MikaCardContent>
            {data?.events.length === 0 ? (
              <EmptyState message="Nenhum compromisso hoje!" action={{ label: 'Adicionar evento', href: '/events' }} />
            ) : (
              <ul className="space-y-2">
                {data?.events.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors duration-200 hover:bg-surface"
                  >
                    <div className="flex-shrink-0 text-center">
                      <p className="text-xs font-bold text-accent">
                        {event.isAllDay ? 'Dia todo' : formatTime(event.startsAt)}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text-primary">{event.title}</p>
                      {event.location && (
                        <p className="mt-0.5 text-xs text-text-tertiary">{event.location}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </MikaCardContent>
        </MikaCard>

        <MikaCard>
          <MikaCardHeader>
            <MikaCardTitle className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-insight" />
              Projetos em andamento
            </MikaCardTitle>
          </MikaCardHeader>
          <MikaCardContent>
            {activeProjects.length === 0 ? (
              <EmptyState message="Nenhum projeto ativo." action={{ label: 'Ver projetos', href: '/projects' }} />
            ) : (
              <ul className="space-y-2">
                {(activeProjects as Array<{ id: string; title: string; status?: string }>).slice(0, 4).map((project) => (
                  <li
                    key={project.id}
                    className="rounded-lg p-3 text-sm text-text-secondary transition-colors duration-200 hover:bg-surface"
                  >
                    {project.title}
                  </li>
                ))}
              </ul>
            )}
          </MikaCardContent>
        </MikaCard>

        <MikaCard>
          <MikaCardHeader>
            <MikaCardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-insight" />
              Insights rápidos
            </MikaCardTitle>
          </MikaCardHeader>
          <MikaCardContent>
            <p className="text-sm text-text-secondary">
              {data?.overdueTasks
                ? `${data.overdueTasks} tarefa${data.overdueTasks > 1 ? 's' : ''} em atraso — revise para manter o ritmo.`
                : `Progresso semanal em ${WEEKLY_PROGRESS}%. Mantenha o foco nas prioridades de hoje.`}
            </p>
          </MikaCardContent>
        </MikaCard>
      </div>

      {(data?.overdueTasks ?? 0) > 0 && (
        <MikaCard className="border-critical/30 bg-critical/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-critical" />
            <div className="flex-1">
              <p className="font-medium text-critical">
                {data?.overdueTasks} tarefa{data!.overdueTasks > 1 ? 's' : ''} em atraso
              </p>
              <p className="text-sm text-critical/70">Revise suas tarefas atrasadas para manter o foco.</p>
            </div>
            <Link
              href="/tasks?status=todo"
              className="whitespace-nowrap text-sm font-medium text-critical transition-colors duration-200 hover:text-critical/80"
            >
              Ver tarefas →
            </Link>
          </div>
        </MikaCard>
      )}
    </div>
  );
}

'use client';

import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import {
  dashboardApi,
  routinesApi,
  type DashboardOverviewData,
  type EventListItem,
} from '@/lib/api-client';
import {
  cn,
  formatTime,
  getGreeting,
  normalizeTaskStatus,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '@/lib/utils';
import {
  MikaCard,
  MikaCardContent,
  MikaCardHeader,
  MikaCardTitle,
} from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FolderOpen,
  Lightbulb,
  Plus,
} from 'lucide-react';
import type { Task } from '@mika/shared';

type TimelineItem =
  | { kind: 'event'; date: Date; item: EventListItem }
  | { kind: 'task'; date: Date; item: Task };

function dateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDayLabel(value: Date) {
  return value.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function getWeekDays(from: string) {
  const start = new Date(from);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function buildTimeline(data?: DashboardOverviewData): TimelineItem[] {
  if (!data) return [];

  return [
    ...data.week.events.map((item) => ({
      kind: 'event' as const,
      date: new Date(item.startsAt),
      item,
    })),
    ...data.week.tasks
      .filter((item) => item.dueAt)
      .map((item) => ({
        kind: 'task' as const,
        date: new Date(item.dueAt as Date),
        item,
      })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 60000,
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['routines', 'latest', 'DAILY_SUMMARY'],
    queryFn: () => routinesApi.getLatest('DAILY_SUMMARY'),
    refetchInterval: 300000,
  });

  const weekDays = useMemo(() => (data ? getWeekDays(data.range.from) : []), [data]);
  const timeline = useMemo(() => buildTimeline(data), [data]);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{getGreeting(user?.name)}</h1>
          <p className="mt-1 capitalize text-text-tertiary">{today}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/tasks" />} variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Tarefa
          </Button>
          <Button render={<Link href="/events" />} className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Agenda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon={<CheckSquare className="h-4 w-4 text-accent" />}
          label="Foco de hoje"
          value={data?.today.tasks.length ?? 0}
          detail="tarefas com prazo hoje"
        />
        <MetricCard
          icon={<CalendarDays className="h-4 w-4 text-progress" />}
          label="Agenda"
          value={data?.today.events.length ?? 0}
          detail="compromissos hoje"
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4 text-critical" />}
          label="Atrasos"
          value={data?.today.overdueTasksCount ?? 0}
          detail="tarefas pedindo revisão"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="space-y-6">
          <MikaCard>
            <MikaCardHeader className="flex flex-row items-center justify-between pb-4">
              <MikaCardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Prioridade prática
              </MikaCardTitle>
              <Link href="/tasks" className="text-xs font-medium text-accent hover:text-accent/80">
                Ver tarefas
              </Link>
            </MikaCardHeader>
            <MikaCardContent>
              {data?.priorityTasks.length ? (
                <ul className="space-y-2">
                  {data.priorityTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </ul>
              ) : (
                <EmptyState message="Sem tarefas prioritárias para hoje." action={{ label: 'Criar tarefa', href: '/tasks' }} />
              )}
            </MikaCardContent>
          </MikaCard>

          <MikaCard>
            <MikaCardHeader className="pb-4">
              <MikaCardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-progress" />
                Semana
              </MikaCardTitle>
            </MikaCardHeader>
            <MikaCardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {weekDays.map((day) => {
                  const key = dateKey(day);
                  const dayTasks = data?.week.tasks.filter((task) => task.dueAt && dateKey(task.dueAt) === key) ?? [];
                  const dayEvents = data?.week.events.filter((event) => dateKey(event.startsAt) === key) ?? [];
                  const isToday = key === dateKey(new Date());

                  return (
                    <div
                      key={key}
                      className={cn(
                        'min-h-28 rounded-xl border border-border bg-bg-secondary/60 p-3',
                        isToday && 'border-accent/70 bg-accent/10',
                      )}
                    >
                      <p className="text-xs font-semibold capitalize text-text-primary">
                        {formatDayLabel(day)}
                      </p>
                      <div className="mt-3 space-y-2 text-xs text-text-tertiary">
                        <p>{dayTasks.length} tarefa{dayTasks.length !== 1 ? 's' : ''}</p>
                        <p>{dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MikaCardContent>
          </MikaCard>
        </section>

        <aside className="space-y-6">
          <MikaCard>
            <MikaCardHeader className="flex flex-row items-center justify-between pb-4">
              <MikaCardTitle className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-progress" />
                Próximos horários
              </MikaCardTitle>
              <Link href="/events" className="text-xs font-medium text-accent hover:text-accent/80">
                Abrir agenda
              </Link>
            </MikaCardHeader>
            <MikaCardContent>
              {timeline.length ? (
                <ul className="space-y-2">
                  {timeline.slice(0, 7).map((item) => (
                    <TimelineRow
                      key={`${item.kind}-${item.item.id}`}
                      item={item}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState message="Nenhum compromisso ou prazo nos próximos dias." />
              )}
            </MikaCardContent>
          </MikaCard>

          <MikaCard>
            <MikaCardHeader className="pb-4">
              <MikaCardTitle className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-insight" />
                Projetos em andamento
              </MikaCardTitle>
            </MikaCardHeader>
            <MikaCardContent>
              {data?.activeProjects.length ? (
                <ul className="space-y-3">
                  {data.activeProjects.map((project) => (
                    <li key={project.id} className="rounded-xl bg-bg-secondary/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 text-sm font-medium text-text-primary">
                          {project.title}
                        </p>
                        <span className="text-xs text-text-tertiary">{project.priority}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-progress"
                          style={{ width: `${project.completionPercentage}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-text-tertiary">
                        {project.taskCount} tarefa{project.taskCount !== 1 ? 's' : ''} · {project.completionPercentage}% concluído
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState message="Nenhum projeto ativo." action={{ label: 'Criar projeto', href: '/projects' }} />
              )}
            </MikaCardContent>
          </MikaCard>

          <MikaCard>
            <MikaCardHeader className="pb-4">
              <MikaCardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-insight" />
                Leitura da Mika
              </MikaCardTitle>
            </MikaCardHeader>
            <MikaCardContent>
              {dailySummary?.content ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                  {dailySummary.content}
                </p>
              ) : (
                <p className="text-sm text-text-tertiary">
                  Resumo diário ainda não foi gerado para hoje.
                </p>
              )}
            </MikaCardContent>
          </MikaCard>
        </aside>
      </div>

      {(data?.overdueTasks.length ?? 0) > 0 && (
        <MikaCard className="border-critical/30 bg-critical/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-critical" />
              <div>
                <p className="font-medium text-critical">
                  {data?.overdueTasks.length} tarefa{data!.overdueTasks.length > 1 ? 's' : ''} em atraso
                </p>
                <p className="text-sm text-critical/80">
                  Revise prazos antes de assumir novos compromissos.
                </p>
              </div>
            </div>
            <Button render={<Link href="/tasks?status=todo" />} variant="destructive">
              Revisar tarefas
            </Button>
          </div>
        </MikaCard>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <MikaCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-secondary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-text-tertiary">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-tertiary">{detail}</p>
        </div>
      </div>
    </MikaCard>
  );
}

function TaskRow({ task }: { task: Task }) {
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
  const status = STATUS_CONFIG[normalizeTaskStatus(task.status)];
  const dueAt = task.dueAt ? new Date(task.dueAt) : null;

  return (
    <li className="flex items-start gap-3 rounded-xl bg-bg-secondary/60 p-3">
      <div className={cn('mt-1.5 h-2 w-2 flex-shrink-0 rounded-full', priority?.color)} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-text-primary">{task.title}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className={cn('rounded-full px-2 py-0.5', priority?.bgLight, priority?.textColor)}>
            {priority?.label}
          </span>
          <span className={cn('rounded-full px-2 py-0.5', status?.color)}>
            {status?.label}
          </span>
          {dueAt && (
            <span className="text-text-tertiary">
              {dueAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const isEvent = item.kind === 'event';
  const title = item.item.title;
  const subtitle = isEvent
    ? item.item.isAllDay
      ? 'Dia inteiro'
      : formatTime(item.date)
    : 'Prazo de tarefa';

  return (
    <li className="flex items-start gap-3 rounded-xl bg-bg-secondary/60 p-3">
      <div className="w-14 flex-shrink-0 text-xs font-semibold capitalize text-text-tertiary">
        {item.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>
      </div>
      {isEvent ? (
        <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-progress" />
      ) : (
        <CheckSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
      )}
    </li>
  );
}

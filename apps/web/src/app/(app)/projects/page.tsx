'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, Plus } from 'lucide-react';

const STATUS_COLORS = {
  ACTIVE: 'bg-progress/10 text-progress border-progress/30',
  PAUSED: 'bg-attention/10 text-attention border-attention/30',
  COMPLETED: 'bg-accent/10 text-accent border-accent/30',
  ARCHIVED: 'bg-text-tertiary/10 text-text-tertiary border-border',
};

const STATUS_LABELS = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
  ARCHIVED: 'Arquivado',
};

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projetos"
        description="Agrupe e acompanhe seus projetos"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo projeto
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <FolderOpen className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">Nenhum projeto criado ainda</p>
        </MikaCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects?.map((project: Record<string, unknown>) => (
            <MikaCard key={project.id as string}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="truncate font-semibold text-text-primary">{project.title as string}</h3>
                <span
                  className={cn(
                    'flex-shrink-0 rounded-full border px-2 py-0.5 text-xs',
                    STATUS_COLORS[project.status as keyof typeof STATUS_COLORS],
                  )}
                >
                  {STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>

              {!!(project.description as string | undefined) && (
                <p className="mb-4 line-clamp-2 text-xs text-text-tertiary">{project.description as string}</p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-tertiary">{project.taskCount as number} tarefas</span>
                  <span className="text-text-secondary">{project.completionPercentage as number}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${project.completionPercentage as number}%` }}
                  />
                </div>
              </div>

              {(project.lifeArea as { label: string } | undefined) && (
                <div className="mt-3 flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: (project.lifeArea as { color: string }).color }}
                  />
                  <span className="text-xs text-text-tertiary">{(project.lifeArea as { label: string }).label}</span>
                </div>
              )}
            </MikaCard>
          ))}
        </div>
      )}
    </div>
  );
}

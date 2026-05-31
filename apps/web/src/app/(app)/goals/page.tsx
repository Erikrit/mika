'use client';

import { useQuery } from '@tanstack/react-query';
import { goalsApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Plus } from 'lucide-react';

const HORIZON_CONFIG = {
  SHORT: { label: 'Curto prazo', color: 'text-progress bg-progress/10 border-progress/30' },
  MEDIUM: { label: 'Médio prazo', color: 'text-attention bg-attention/10 border-attention/30' },
  LONG: { label: 'Longo prazo', color: 'text-accent bg-accent/10 border-accent/30' },
};

export default function GoalsPage() {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.list(),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Objetivos"
        description="Acompanhe seus objetivos de vida"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo objetivo
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : goals?.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <Target className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">Nenhum objetivo criado ainda</p>
        </MikaCard>
      ) : (
        <div className="space-y-3">
          {goals?.map((goal: Record<string, unknown>) => {
            const horizon = HORIZON_CONFIG[goal.horizon as keyof typeof HORIZON_CONFIG];
            return (
              <MikaCard key={goal.id as string}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{goal.title as string}</h3>
                    {(goal.description as string | undefined) && (
                      <p className="mt-1 text-xs text-text-tertiary">{goal.description as string}</p>
                    )}
                  </div>
                  <span className={cn('flex-shrink-0 rounded-full border px-2 py-0.5 text-xs', horizon?.color)}>
                    {horizon?.label}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary">Progresso</span>
                    <span className="text-text-secondary">{goal.progress as number}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-insight transition-all duration-300"
                      style={{ width: `${goal.progress as number}%` }}
                    />
                  </div>
                </div>

                {(goal.targetDate as string | undefined) && (
                  <p className="mt-2 text-xs text-text-tertiary">
                    Prazo: {new Date(goal.targetDate as string).toLocaleDateString('pt-BR')}
                    {(goal.isOverdue as boolean) && (
                      <span className="ml-2 text-critical">Atrasado</span>
                    )}
                  </p>
                )}
              </MikaCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

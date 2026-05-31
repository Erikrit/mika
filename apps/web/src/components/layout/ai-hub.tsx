'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLayout } from '@/contexts/layout-context';
import { dashboardApi } from '@/lib/api-client';
import { getGreeting } from '@/lib/utils';
import { MikaAvatar } from '@/components/ui/mika-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

function useIsXl() {
  const [isXl, setIsXl] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const update = () => setIsXl(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isXl;
}

function AiHubContent() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: dashboardApi.getToday,
    refetchInterval: 60000,
  });

  const priorityTasks = data?.tasks.filter((t) => t.priority <= 2) ?? [];
  const nextActions = [
    ...priorityTasks.slice(0, 2).map((t) => ({ label: t.title })),
    ...(data?.overdueTasks ? [{ label: 'Revisar tarefas atrasadas' }] : []),
  ].slice(0, 3);

  const suggestions = ['Organizar semana', 'Revisar metas', 'Planejar finanças'];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center px-6 py-8 text-center">
        <MikaAvatar size="lg" />
        <p className="mt-4 text-lg font-semibold text-text-primary">{getGreeting(user?.name)}</p>
        <p className="mt-1 text-sm text-text-tertiary">Seu resumo do dia</p>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <ArrowRight className="h-3.5 w-3.5" />
              Próximas ações
            </h3>
            {nextActions.length === 0 ? (
              <p className="text-sm text-text-tertiary">Nenhuma ação pendente para hoje.</p>
            ) : (
              <ul className="space-y-2">
                {nextActions.map((action, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-text-secondary transition-colors duration-200 hover:bg-surface"
                  >
                    {action.label}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <Lightbulb className="h-3.5 w-3.5 text-insight" />
              Insights
            </h3>
            <p className="rounded-lg border border-insight/20 bg-insight/5 p-3 text-sm text-text-secondary">
              {data?.overdueTasks
                ? `Você tem ${data.overdueTasks} tarefa${data.overdueTasks > 1 ? 's' : ''} em atraso. Priorize-as para manter o foco.`
                : 'Seu progresso semanal está em 78%. Continue assim — consistência é a chave.'}
            </p>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Sugestões
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Badge key={s} variant="secondary" className="cursor-default">
                  {s}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Input
              disabled
              placeholder="Conversar com Mika..."
              className="cursor-not-allowed opacity-60"
            />
          </TooltipTrigger>
          <TooltipContent>Chat inteligente em breve</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function AiHub() {
  const { aiHubOpen, setAiHubOpen } = useLayout();
  const isXl = useIsXl();
  const showPanel = isXl || aiHubOpen;
  const showSheet = !isXl && aiHubOpen;

  return (
    <>
      {showPanel && (
        <aside className="hidden h-full w-80 flex-shrink-0 flex-col border-l border-border bg-bg-secondary/60 backdrop-blur-sm xl:flex xl:w-96">
          <AiHubContent />
        </aside>
      )}

      <Sheet open={showSheet} onOpenChange={setAiHubOpen}>
        <SheetContent side="right" className="w-full max-w-sm border-border bg-bg-secondary p-0 xl:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Assistente Mika</SheetTitle>
          </SheetHeader>
          <AiHubContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function AiHubToggleFab() {
  const { toggleAiHub, aiHubOpen } = useLayout();
  const isXl = useIsXl();

  if (isXl || aiHubOpen) return null;

  return (
    <Button
      size="icon-lg"
      onClick={toggleAiHub}
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg md:hidden"
      aria-label="Abrir assistente"
    >
      <Sparkles className="h-5 w-5" />
    </Button>
  );
}

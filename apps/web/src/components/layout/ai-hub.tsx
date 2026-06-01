'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLayout } from '@/contexts/layout-context';
import { chatApi, dashboardApi } from '@/lib/api-client';
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
import { ArrowRight, Lightbulb, Loader2, Send, Sparkles } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function AiHubContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: dashboardApi.getToday,
    refetchInterval: 60000,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const priorityTasks = data?.tasks.filter((t) => t.priority <= 2) ?? [];
  const nextActions = [
    ...priorityTasks.slice(0, 2).map((t) => ({ label: t.title })),
    ...(data?.overdueTasks ? [{ label: 'Revisar tarefas atrasadas' }] : []),
  ].slice(0, 3);

  const suggestions = ['O que tenho para hoje?', 'Quais são minhas prioridades?', 'Organizar semana'];

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setInput('');
    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setLoading(true);

    try {
      const result = await chatApi.streamMessage(message, sessionId, (token) => {
        setMessages((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          const last = next[lastIdx];
          if (last?.role === 'assistant') {
            next[lastIdx] = { ...last, content: last.content + token };
          }
          return next;
        });
      });
      setSessionId(result.sessionId);
    } catch {
      setError('Não foi possível enviar a mensagem. Tente novamente.');
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center px-6 py-6 text-center">
        <MikaAvatar size="lg" />
        <p className="mt-3 text-lg font-semibold text-text-primary">{getGreeting(user?.name)}</p>
        <p className="mt-1 text-sm text-text-tertiary">Converse com a Mika</p>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.length === 0 && (
            <>
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
                        className="rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-text-secondary"
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
                    <Badge
                      key={s}
                      variant="secondary"
                      className="cursor-pointer hover:bg-surface"
                      onClick={() => handleSend(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
            </>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'ml-6 bg-accent/20 text-text-primary'
                  : 'mr-6 border border-border bg-surface/50 text-text-secondary'
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="mr-6 flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-text-tertiary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mika está pensando...
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Conversar com Mika..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AiHub() {
  const { aiHubOpen, setAiHubOpen } = useLayout();
  const isDesktop = useIsDesktop();
  const showPanel = isDesktop || aiHubOpen;
  const showSheet = !isDesktop && aiHubOpen;

  return (
    <>
      {showPanel && (
        <aside className="hidden h-full w-80 flex-shrink-0 flex-col border-l border-border bg-bg-secondary/60 backdrop-blur-sm xl:flex xl:w-96">
          <AiHubContent />
        </aside>
      )}

      {!isDesktop && (
        <Sheet open={showSheet} onOpenChange={setAiHubOpen}>
          <SheetContent side="right" className="w-full max-w-sm border-border bg-bg-secondary p-0 xl:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Assistente Mika</SheetTitle>
            </SheetHeader>
            <AiHubContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

export function AiHubToggleFab() {
  const { toggleAiHub, aiHubOpen } = useLayout();
  const isDesktop = useIsDesktop();

  if (isDesktop || aiHubOpen) return null;

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

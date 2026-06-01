'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useChat } from '@/contexts/chat-context';
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
import { ArrowRight, Lightbulb, Loader2, MessageSquarePlus, Send, Sparkles } from 'lucide-react';

function formatSessionLabel(preview: string | null, updatedAt: string, index: number) {
  if (preview) {
    return preview.length > 28 ? `${preview.slice(0, 28)}…` : preview;
  }
  const date = new Date(updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  return `Conversa ${index + 1} · ${date}`;
}

function AiHubContent() {
  const { user } = useAuth();
  const {
    sessions,
    activeSessionId,
    messages,
    loading,
    error,
    sending,
    selectSession,
    startNewSession,
    sendMessage,
  } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: dashboardApi.getToday,
    refetchInterval: 60000,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, loading]);

  const priorityTasks = data?.tasks.filter((t) => t.priority <= 2) ?? [];
  const nextActions = [
    ...priorityTasks.slice(0, 2).map((t) => ({ label: t.title })),
    ...(data?.overdueTasks ? [{ label: 'Revisar tarefas atrasadas' }] : []),
  ].slice(0, 3);

  const suggestions = ['O que tenho para hoje?', 'Quais são minhas prioridades?', 'Organizar semana'];

  const showEmptyState = messages.length === 0 && !loading;

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setInput('');
    await sendMessage(message);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex flex-col items-center px-6 py-6 text-center">
        <MikaAvatar size="lg" />
        <p className="mt-3 text-lg font-semibold text-text-primary">{getGreeting(user?.name)}</p>
        <p className="mt-1 text-sm text-text-tertiary">Converse com a Mika</p>
      </div>

      <Separator />

      {sessions.length > 0 && (
        <div className="flex min-h-0 flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
          {sessions.map((session, index) => (
            <Button
              key={session.id}
              type="button"
              variant={activeSessionId === session.id ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 max-w-[9rem] truncate text-xs"
              disabled={loading || sending}
              onClick={() => void selectSession(session.id)}
            >
              {formatSessionLabel(session.preview, session.updatedAt, index)}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled={loading || sending}
            onClick={startNewSession}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Nova conversa
          </Button>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-4">
          {loading && messages.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-tertiary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando conversa...
            </div>
          )}

          {showEmptyState && (
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
                    : 'Tudo em dia! Pergunte o que precisa.'}
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

          {sending && (
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
            disabled={sending || loading}
          />
          <Button type="submit" size="icon" disabled={sending || loading || !input.trim()}>
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
      {isDesktop && showPanel && (
        <aside className="hidden h-full w-80 flex-shrink-0 flex-col border-l border-border bg-bg-secondary/60 backdrop-blur-sm xl:flex xl:w-96">
          <AiHubContent />
        </aside>
      )}

      {!isDesktop && (
        <Sheet open={showSheet} onOpenChange={setAiHubOpen}>
          <SheetContent
            side="right"
            className="flex h-full w-full max-w-sm flex-col border-border bg-bg-secondary p-0 xl:hidden"
          >
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

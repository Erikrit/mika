'use client';

import { useAuth } from '@/contexts/auth-context';
import { useLayout } from '@/contexts/layout-context';
import { getGreeting } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Search } from 'lucide-react';
import { MikaAvatar } from '@/components/ui/mika-avatar';

export function Header() {
  const { user } = useAuth();
  const { toggleAiHub, aiHubOpen } = useLayout();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-bg-secondary/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <MikaAvatar size="sm" />
        <span className="font-semibold text-text-primary">Mika</span>
      </div>

      <div className="hidden flex-1 md:block">
        <p className="text-sm capitalize text-text-tertiary">{today}</p>
        <p className="text-sm font-medium text-text-secondary">{getGreeting(user?.name)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled
          className="text-text-tertiary"
          title="Busca em breve"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant={aiHubOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={toggleAiHub}
          className="xl:hidden gap-1.5"
        >
          <Sparkles className="h-4 w-4 text-insight" />
          <span className="hidden sm:inline">Assistente</span>
        </Button>
      </div>
    </header>
  );
}

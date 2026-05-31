'use client';

import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api-client';
import { formatTime } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Plus } from 'lucide-react';

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agenda"
        description="Seus compromissos e eventos"
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo evento
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : events?.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <Calendar className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">Nenhum evento encontrado</p>
        </MikaCard>
      ) : (
        <div className="space-y-2">
          {events?.map((event: Record<string, unknown>) => (
            <MikaCard key={event.id as string} className="py-4">
              <div className="flex items-start gap-4">
                <div className="min-w-[50px] flex-shrink-0 text-center">
                  <p className="text-xs font-bold text-accent">
                    {(event.isAllDay as boolean) ? 'Dia todo' : formatTime(event.startsAt as string)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {new Date(event.startsAt as string).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{event.title as string}</p>
                  {(event.location as string) && (
                    <p className="mt-0.5 text-xs text-text-tertiary">{event.location as string}</p>
                  )}
                  {(event.description as string) && (
                    <p className="mt-0.5 truncate text-xs text-text-tertiary">{event.description as string}</p>
                  )}
                </div>
              </div>
            </MikaCard>
          ))}
        </div>
      )}
    </div>
  );
}

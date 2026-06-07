'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, lifeAreasApi, type EventListItem } from '@/lib/api-client';
import { formatTime } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { CreateEventDto, UpdateEventDto } from '@mika/shared';

type PeriodPreset = '30d' | 'week' | 'month' | 'all';

const SELECT_CLASS =
  'w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none';

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function getPeriodRange(preset: PeriodPreset): { from?: string; to?: string } {
  const now = new Date();
  if (preset === 'all') return {};

  if (preset === 'week') {
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      from: startOfDay(monday).toISOString(),
      to: endOfDay(sunday).toISOString(),
    };
  }

  if (preset === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: startOfDay(first).toISOString(),
      to: endOfDay(last).toISOString(),
    };
  }

  const to = new Date(now);
  to.setDate(to.getDate() + 30);
  return {
    from: startOfDay(now).toISOString(),
    to: endOfDay(to).toISOString(),
  };
}

function toDatetimeLocal(value: string | Date): string {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

export default function EventsPage() {
  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const queryClient = useQueryClient();

  const rangeParams = useMemo(() => getPeriodRange(period), [period]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', period],
    queryFn: () => eventsApi.list(rangeParams as Record<string, string>),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  function openCreate() {
    setEditingEvent(null);
    setFormMode('create');
  }

  function openEdit(event: EventListItem) {
    setEditingEvent(event);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingEvent(null);
  }

  function handleDelete(event: EventListItem) {
    if (!window.confirm(`Excluir o evento "${event.title}"?`)) return;
    deleteMutation.mutate(event.id);
  }

  function handleFormSuccess() {
    closeForm();
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agenda"
        description="Seus compromissos e eventos"
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo evento
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['30d', 'Próximos 30 dias'],
            ['week', 'Esta semana'],
            ['month', 'Este mês'],
            ['all', 'Todos'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            variant={period === value ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setPeriod(value)}
          >
            {label}
          </Button>
        ))}
      </div>

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
          <Button variant="link" onClick={openCreate} className="mt-4">
            Criar seu primeiro evento
          </Button>
        </MikaCard>
      ) : (
        <div className="space-y-2">
          {events?.map((event) => (
            <MikaCard key={event.id} className="py-4">
              <div className="flex items-start gap-4">
                <div className="min-w-[50px] flex-shrink-0 text-center">
                  <p className="text-xs font-bold text-accent">
                    {event.isAllDay ? 'Dia todo' : formatTime(String(event.startsAt))}
                  </p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {new Date(event.startsAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{event.title}</p>
                  {event.location && (
                    <p className="mt-0.5 text-xs text-text-tertiary">{event.location}</p>
                  )}
                  {event.description && (
                    <p className="mt-0.5 truncate text-xs text-text-tertiary">{event.description}</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(event)}
                    aria-label="Editar evento"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(event)}
                    disabled={deleteMutation.isPending}
                    aria-label="Excluir evento"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </MikaCard>
          ))}
        </div>
      )}

      {formMode && (
        <EventFormModal
          mode={formMode}
          event={editingEvent ?? undefined}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

function EventFormModal({
  mode,
  event,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  event?: EventListItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: lifeAreas = [] } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const defaultStart = event?.startsAt
    ? event.isAllDay
      ? toDateInput(event.startsAt)
      : toDatetimeLocal(event.startsAt)
    : toDatetimeLocal(new Date());

  const defaultEnd = event?.endsAt
    ? event.isAllDay
      ? toDateInput(event.endsAt)
      : toDatetimeLocal(event.endsAt)
    : '';

  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    location: event?.location ?? '',
    lifeAreaId: event?.lifeAreaId ?? '',
    isAllDay: event?.isAllDay ?? false,
    startsAt: defaultStart,
    endsAt: defaultEnd,
  });
  const [formError, setFormError] = useState<string | null>(null);

  function updateForm(patch: Partial<typeof form>) {
    setFormError(null);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const startsAt = form.isAllDay
        ? new Date(`${form.startsAt}T00:00:00`)
        : new Date(form.startsAt);
      const endsAt = form.endsAt
        ? form.isAllDay
          ? new Date(`${form.endsAt}T23:59:59`)
          : new Date(form.endsAt)
        : undefined;

      const payload: CreateEventDto | UpdateEventDto = {
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        lifeAreaId: form.lifeAreaId || undefined,
        isAllDay: form.isAllDay,
        startsAt,
        endsAt,
      };

      if (mode === 'edit' && event) {
        return eventsApi.update(event.id, payload);
      }

      return eventsApi.create(payload as CreateEventDto);
    },
    onSuccess,
    onError: () => {
      setFormError('Não foi possível salvar o evento. Tente novamente.');
    },
  });

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <MikaCard className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
        <h2 className="mb-5 text-lg font-bold text-text-primary">
          {isEdit ? 'Editar Evento' : 'Novo Evento'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Título *</Label>
            <Input
              autoFocus
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Nome do compromisso"
            />
          </div>

          <div>
            <Label className="mb-1.5">Descrição</Label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>

          <div>
            <Label className="mb-1.5">Local</Label>
            <Input
              value={form.location}
              onChange={(e) => updateForm({ location: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.isAllDay}
              onChange={(e) => updateForm({ isAllDay: e.target.checked })}
              className="rounded border-input accent-accent"
            />
            Dia inteiro
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Início *</Label>
              <Input
                type={form.isAllDay ? 'date' : 'datetime-local'}
                value={form.startsAt}
                onChange={(e) => updateForm({ startsAt: e.target.value })}
              />
            </div>

            <div>
              <Label className="mb-1.5">Fim</Label>
              <Input
                type={form.isAllDay ? 'date' : 'datetime-local'}
                value={form.endsAt}
                onChange={(e) => updateForm({ endsAt: e.target.value })}
              />
            </div>
          </div>

          {lifeAreas.length > 0 && (
            <div>
              <Label className="mb-1.5">Área de vida</Label>
              <select
                value={form.lifeAreaId}
                onChange={(e) => updateForm({ lifeAreaId: e.target.value })}
                className={SELECT_CLASS}
              >
                <option value="">Sem área</option>
                {lifeAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {formError && <p className="mt-4 text-sm text-destructive">{formError}</p>}

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.title.trim() || !form.startsAt || mutation.isPending}
            className="flex-1 gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar evento'}
          </Button>
        </div>
      </MikaCard>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reflectionsApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PenLine, Plus, Loader2, Trash2 } from 'lucide-react';
import type { CreateReflectionDto, Reflection, RoutineType } from '@mika/shared';

const ENERGY_CONFIG = {
  low: { label: 'Baixa energia', color: 'bg-attention/10 text-attention border-attention/30' },
  medium: { label: 'Energia média', color: 'bg-progress/10 text-progress border-progress/30' },
  high: { label: 'Alta energia', color: 'bg-accent/10 text-accent border-accent/30' },
};

const ROUTINE_LABELS: Record<RoutineType, string> = {
  morning: 'Manhã',
  midday: 'Meio-dia',
  evening: 'Tarde',
  free: 'Livre',
};

const SELECT_CLASS =
  'w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none';

export default function ReflectionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: reflections, isLoading } = useQuery({
    queryKey: ['reflections'],
    queryFn: reflectionsApi.list,
  });

  const sorted = [...(reflections ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reflectionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reflections'] }),
  });

  function handleDelete(reflection: Reflection) {
    if (!window.confirm('Excluir esta reflexão?')) return;
    deleteMutation.mutate(reflection.id);
  }

  function handleFormSuccess() {
    setFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['reflections'] });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reflexões"
        description="Diário e reflexões pessoais"
        action={
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova reflexão
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <PenLine className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">Nenhuma reflexão registrada ainda</p>
          <Button variant="link" onClick={() => setFormOpen(true)} className="mt-4">
            Escrever sua primeira reflexão
          </Button>
        </MikaCard>
      ) : (
        <div className="space-y-3">
          {sorted.map((reflection) => {
            const energy = reflection.energyLevel
              ? ENERGY_CONFIG[reflection.energyLevel]
              : null;
            return (
              <MikaCard key={reflection.id}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-xs text-text-tertiary">
                    {new Date(reflection.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(reflection)}
                    disabled={deleteMutation.isPending}
                    aria-label="Excluir reflexão"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="whitespace-pre-wrap text-sm text-text-primary">{reflection.content}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {energy && (
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs', energy.color)}>
                      {energy.label}
                    </span>
                  )}
                  {reflection.routineType && (
                    <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-text-tertiary">
                      {ROUTINE_LABELS[reflection.routineType]}
                    </span>
                  )}
                  {reflection.mood && (
                    <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-text-tertiary">
                      {reflection.mood}
                    </span>
                  )}
                </div>
              </MikaCard>
            );
          })}
        </div>
      )}

      {formOpen && (
        <ReflectionFormModal onClose={() => setFormOpen(false)} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
}

function ReflectionFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    content: '',
    energyLevel: '' as '' | 'low' | 'medium' | 'high',
    mood: '',
    routineType: '' as '' | RoutineType,
  });
  const [formError, setFormError] = useState<string | null>(null);

  function updateForm(patch: Partial<typeof form>) {
    setFormError(null);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateReflectionDto = {
        content: form.content,
        energyLevel: form.energyLevel || undefined,
        mood: form.mood || undefined,
        routineType: form.routineType || undefined,
      };
      return reflectionsApi.create(payload);
    },
    onSuccess,
    onError: () => {
      setFormError('Não foi possível salvar a reflexão. Tente novamente.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <MikaCard className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
        <h2 className="mb-5 text-lg font-bold text-text-primary">Nova Reflexão</h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Conteúdo *</Label>
            <textarea
              autoFocus
              value={form.content}
              onChange={(e) => updateForm({ content: e.target.value })}
              rows={6}
              placeholder="Como você está se sentindo? O que aprendeu hoje?"
              className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Energia</Label>
              <select
                value={form.energyLevel}
                onChange={(e) =>
                  updateForm({
                    energyLevel: e.target.value as typeof form.energyLevel,
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="">Não informar</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <Label className="mb-1.5">Tipo</Label>
              <select
                value={form.routineType}
                onChange={(e) =>
                  updateForm({
                    routineType: e.target.value as typeof form.routineType,
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="">Não informar</option>
                <option value="morning">Manhã</option>
                <option value="midday">Meio-dia</option>
                <option value="evening">Tarde</option>
                <option value="free">Livre</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5">Humor</Label>
            <input
              type="text"
              value={form.mood}
              onChange={(e) => updateForm({ mood: e.target.value })}
              placeholder="Ex.: tranquilo, animado..."
              className="w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {formError && <p className="mt-4 text-sm text-destructive">{formError}</p>}

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.content.trim() || mutation.isPending}
            className="flex-1 gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar reflexão
          </Button>
        </div>
      </MikaCard>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi, lifeAreasApi, type GoalListItem } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { CreateGoalDto, GoalHorizon, GoalStatus, UpdateGoalDto } from '@mika/shared';

const HORIZON_CONFIG = {
  SHORT: { label: 'Curto prazo', color: 'text-progress bg-progress/10 border-progress/30' },
  MEDIUM: { label: 'Médio prazo', color: 'text-attention bg-attention/10 border-attention/30' },
  LONG: { label: 'Longo prazo', color: 'text-accent bg-accent/10 border-accent/30' },
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  ACHIEVED: 'Alcançado',
  ABANDONED: 'Abandonado',
};

const SELECT_CLASS =
  'w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none';

function isGoalOverdue(goal: GoalListItem): boolean {
  if (goal.isOverdue) return true;
  const status = String(goal.status).toUpperCase();
  if (!goal.targetDate || goal.progress >= 100 || status !== 'ACTIVE') return false;
  return new Date(goal.targetDate) < new Date();
}

export default function GoalsPage() {
  const [horizonFilter, setHorizonFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalListItem | null>(null);
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', horizonFilter],
    queryFn: () => goalsApi.list(horizonFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  function openCreate() {
    setEditingGoal(null);
    setFormMode('create');
  }

  function openEdit(goal: GoalListItem) {
    setEditingGoal(goal);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingGoal(null);
  }

  function handleDelete(goal: GoalListItem) {
    if (!window.confirm(`Excluir o objetivo "${goal.title}"?`)) return;
    deleteMutation.mutate(goal.id);
  }

  function handleFormSuccess() {
    closeForm();
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Objetivos"
        description="Acompanhe seus objetivos de vida"
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo objetivo
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['', 'Todos'],
            ['short', 'Curto prazo'],
            ['medium', 'Médio prazo'],
            ['long', 'Longo prazo'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            variant={horizonFilter === value ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setHorizonFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

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
          <Button variant="link" onClick={openCreate} className="mt-4">
            Criar seu primeiro objetivo
          </Button>
        </MikaCard>
      ) : (
        <div className="space-y-3">
          {goals?.map((goal) => {
            const horizonKey = String(goal.horizon).toUpperCase() as keyof typeof HORIZON_CONFIG;
            const horizon = HORIZON_CONFIG[horizonKey];
            const overdue = isGoalOverdue(goal);
            return (
              <MikaCard key={goal.id}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text-primary">{goal.title}</h3>
                    {goal.description && (
                      <p className="mt-1 text-xs text-text-tertiary">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs', horizon?.color)}>
                      {horizon?.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(goal)}
                      aria-label="Editar objetivo"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(goal)}
                      disabled={deleteMutation.isPending}
                      aria-label="Excluir objetivo"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary">Progresso</span>
                    <span className="text-text-secondary">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-insight transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                  <span>{STATUS_LABELS[String(goal.status).toUpperCase()] ?? goal.status}</span>
                  {goal.targetDate && (
                    <span>
                      Prazo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                      {overdue && <span className="ml-2 text-critical">Atrasado</span>}
                    </span>
                  )}
                  {goal.lifeArea && (
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: goal.lifeArea.color }}
                      />
                      {goal.lifeArea.label}
                    </span>
                  )}
                </div>
              </MikaCard>
            );
          })}
        </div>
      )}

      {formMode && (
        <GoalFormModal
          mode={formMode}
          goal={editingGoal ?? undefined}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

function GoalFormModal({
  mode,
  goal,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  goal?: GoalListItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: lifeAreas = [] } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const [form, setForm] = useState({
    title: goal?.title ?? '',
    description: goal?.description ?? '',
    lifeAreaId: goal?.lifeAreaId ?? lifeAreas[0]?.id ?? '',
    horizon: (goal?.horizon ? String(goal.horizon).toLowerCase() : 'medium') as GoalHorizon,
    status: (goal?.status ? String(goal.status).toLowerCase() : 'active') as GoalStatus,
    progress: goal?.progress ?? 0,
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  function updateForm(patch: Partial<typeof form>) {
    setFormError(null);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateGoalDto | UpdateGoalDto = {
        title: form.title,
        description: form.description || undefined,
        lifeAreaId: form.lifeAreaId,
        horizon: form.horizon,
        status: form.status,
        progress: form.progress,
        targetDate: form.targetDate ? new Date(form.targetDate) : undefined,
      };

      if (mode === 'edit' && goal) {
        return goalsApi.update(goal.id, payload);
      }

      return goalsApi.create(payload as CreateGoalDto);
    },
    onSuccess,
    onError: () => {
      setFormError('Não foi possível salvar o objetivo. Tente novamente.');
    },
  });

  const isEdit = mode === 'edit';
  const canSubmit = form.title.trim() && form.lifeAreaId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <MikaCard className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
        <h2 className="mb-5 text-lg font-bold text-text-primary">
          {isEdit ? 'Editar Objetivo' : 'Novo Objetivo'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Título *</Label>
            <Input
              autoFocus
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Qual é seu objetivo?"
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

          {lifeAreas.length > 0 && (
            <div>
              <Label className="mb-1.5">Área de vida *</Label>
              <select
                value={form.lifeAreaId}
                onChange={(e) => updateForm({ lifeAreaId: e.target.value })}
                className={SELECT_CLASS}
              >
                {lifeAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Horizonte</Label>
              <select
                value={form.horizon}
                onChange={(e) => updateForm({ horizon: e.target.value as GoalHorizon })}
                className={SELECT_CLASS}
              >
                <option value="short">Curto prazo</option>
                <option value="medium">Médio prazo</option>
                <option value="long">Longo prazo</option>
              </select>
            </div>

            <div>
              <Label className="mb-1.5">Status</Label>
              <select
                value={form.status}
                onChange={(e) => updateForm({ status: e.target.value as GoalStatus })}
                className={SELECT_CLASS}
              >
                <option value="active">Ativo</option>
                <option value="achieved">Alcançado</option>
                <option value="abandoned">Abandonado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Progresso ({form.progress}%)</Label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => updateForm({ progress: Number(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <Label className="mb-1.5">Prazo</Label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) => updateForm({ targetDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {formError && <p className="mt-4 text-sm text-destructive">{formError}</p>}

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="flex-1 gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar objetivo'}
          </Button>
        </div>
      </MikaCard>
    </div>
  );
}

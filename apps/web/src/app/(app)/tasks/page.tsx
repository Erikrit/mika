'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, lifeAreasApi } from '@/lib/api-client';
import { PRIORITY_CONFIG, STATUS_CONFIG, cn, normalizeTaskStatus } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, CheckCircle2, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '@mika/shared';

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => tasksApi.list(statusFilter ? { status: statusFilter } : {}),
  });

  const { data: lifeAreas } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => tasksApi.complete(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      setActionError('Não foi possível concluir a tarefa. Tente novamente.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      setActionError('Não foi possível excluir a tarefa. Tente novamente.');
    },
  });

  function openCreate() {
    setEditingTask(null);
    setFormMode('create');
    setActionError(null);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormMode('edit');
    setActionError(null);
  }

  function closeForm() {
    setFormMode(null);
    setEditingTask(null);
  }

  function handleDelete(task: Task) {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;
    deleteMutation.mutate(task.id);
  }

  function handleFormSuccess(mode: 'create' | 'edit') {
    closeForm();
    if (mode === 'create') {
      setStatusFilter('');
    }
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tarefas"
        description="Gerencie suas tarefas e prioridades"
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova tarefa
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {([['', 'Todas'], ['todo', 'A fazer'], ['in_progress', 'Em andamento'], ['done', 'Concluídas']] as const).map(
          ([value, label]) => (
            <Button
              key={value}
              variant={statusFilter === value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ),
        )}
      </div>

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : tasks?.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <CheckCircle2 className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">Nenhuma tarefa encontrada</p>
          <Button variant="link" onClick={openCreate} className="mt-4">
            Criar sua primeira tarefa
          </Button>
        </MikaCard>
      ) : (
        <div className="space-y-2">
          {tasks?.map((task) => {
            const status = normalizeTaskStatus(task.status);
            const p = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
            const s = STATUS_CONFIG[status];
            const isDone = status === 'done';
            return (
              <MikaCard key={task.id} className="py-4">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => !isDone && completeMutation.mutate(task.id)}
                    disabled={isDone || completeMutation.isPending}
                    className={cn(
                      'mt-0.5 flex-shrink-0 transition-colors duration-200',
                      isDone ? 'text-progress' : 'text-text-tertiary hover:text-accent',
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'font-medium',
                        isDone ? 'text-text-tertiary line-through' : 'text-text-primary',
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-1 truncate text-xs text-text-tertiary">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs', s?.color)}>{s?.label}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs', p?.bgLight, p?.textColor)}>
                        {p?.label}
                      </span>
                      {task.dueAt && (
                        <span className="text-xs text-text-tertiary">
                          {new Date(task.dueAt).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(task)}
                      aria-label="Editar tarefa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(task)}
                      disabled={deleteMutation.isPending}
                      aria-label="Excluir tarefa"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </MikaCard>
            );
          })}
        </div>
      )}

      {formMode && (
        <TaskFormModal
          mode={formMode}
          task={editingTask ?? undefined}
          lifeAreas={lifeAreas ?? []}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

function TaskFormModal({
  mode,
  task,
  lifeAreas,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  task?: Task;
  lifeAreas: Array<{ id: string; label: string; color: string }>;
  onClose: () => void;
  onSuccess: (mode: 'create' | 'edit') => void;
}) {
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 3,
    lifeAreaId: task?.lifeAreaId ?? '',
    dueAt: task?.dueAt ? new Date(task.dueAt).toISOString().slice(0, 10) : '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  function updateForm(patch: Partial<typeof form>) {
    setFormError(null);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority as 1 | 2 | 3 | 4 | 5,
        lifeAreaId: form.lifeAreaId || undefined,
        dueAt: form.dueAt ? new Date(form.dueAt) : undefined,
      };

      if (mode === 'edit' && task) {
        return tasksApi.update(task.id, payload);
      }

      return tasksApi.create({ ...payload, contextTags: [] });
    },
    onSuccess: () => onSuccess(mode),
    onError: () => {
      setFormError('Não foi possível salvar a tarefa. Tente novamente.');
    },
  });

  const isEdit = mode === 'edit';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <MikaCard
        className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-lg font-bold text-text-primary">
          {isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Título *</Label>
            <Input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="O que precisa ser feito?"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Prioridade</Label>
              <select
                value={form.priority}
                onChange={(e) =>
                  updateForm({ priority: Number(e.target.value) as Task['priority'] })
                }
                className="w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1.5">Prazo</Label>
              <Input
                type="date"
                value={form.dueAt}
                onChange={(e) => updateForm({ dueAt: e.target.value })}
              />
            </div>
          </div>

          {lifeAreas.length > 0 && (
            <div>
              <Label className="mb-1.5">Área de vida</Label>
              <select
                value={form.lifeAreaId}
                onChange={(e) => updateForm({ lifeAreaId: e.target.value })}
                className="w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="">Sem área</option>
                {lifeAreas.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
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
            disabled={!form.title.trim() || mutation.isPending}
            className="flex-1 gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar tarefa'}
          </Button>
        </div>
      </MikaCard>
    </div>
  );
}

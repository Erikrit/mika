'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, lifeAreasApi, type ProjectListItem } from '@/lib/api-client';
import { PRIORITY_CONFIG, cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, Plus, Loader2, Pencil, Trash2, Sparkles, Upload, X } from 'lucide-react';
import type {
  CreateProjectDto,
  CreateProjectFromDraftDto,
  ProjectDraftDto,
  ProjectStatus,
  UpdateProjectDto,
} from '@mika/shared';

const STATUS_COLORS = {
  ACTIVE: 'bg-progress/10 text-progress border-progress/30',
  PAUSED: 'bg-attention/10 text-attention border-attention/30',
  COMPLETED: 'bg-accent/10 text-accent border-accent/30',
  ARCHIVED: 'bg-text-tertiary/10 text-text-tertiary border-border',
};

const STATUS_LABELS = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
  ARCHIVED: 'Arquivado',
};

const SELECT_CLASS =
  'w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none';

function getTaskCount(project: ProjectListItem): number {
  return project.taskCount ?? project._count?.tasks ?? 0;
}

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [aiDraftOpen, setAiDraftOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const filtered = statusFilter
    ? projects?.filter((p) => String(p.status).toUpperCase() === statusFilter.toUpperCase())
    : projects;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  function openCreate() {
    setEditingProject(null);
    setFormMode('create');
  }

  function openEdit(project: ProjectListItem) {
    setEditingProject(project);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingProject(null);
  }

  function handleDelete(project: ProjectListItem) {
    if (!window.confirm(`Excluir o projeto "${project.title}"?`)) return;
    deleteMutation.mutate(project.id);
  }

  function handleFormSuccess() {
    closeForm();
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projetos"
        description="Agrupe objetivos, tarefas e planos em projetos executáveis"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setAiDraftOpen(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Criar com Mika
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo projeto
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['', 'Todos'],
            ['ACTIVE', 'Ativos'],
            ['PAUSED', 'Pausados'],
            ['COMPLETED', 'Concluídos'],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            variant={statusFilter === value ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <FolderOpen className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">Nenhum projeto criado ainda</p>
          <Button variant="link" onClick={openCreate} className="mt-4">
            Criar seu primeiro projeto
          </Button>
        </MikaCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered?.map((project) => {
            const statusKey = String(project.status).toUpperCase() as keyof typeof STATUS_COLORS;
            const taskCount = getTaskCount(project);
            const completion = project.completionPercentage ?? 0;
            return (
              <MikaCard key={project.id}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="truncate font-semibold text-text-primary">{project.title}</h3>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs',
                        STATUS_COLORS[statusKey],
                      )}
                    >
                      {STATUS_LABELS[statusKey]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(project)}
                      aria-label="Editar projeto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(project)}
                      disabled={deleteMutation.isPending}
                      aria-label="Excluir projeto"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {project.description && (
                  <p className="mb-4 line-clamp-2 text-xs text-text-tertiary">{project.description}</p>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-tertiary">{taskCount} tarefas</span>
                    {project.completionPercentage != null && (
                      <span className="text-text-secondary">{completion}%</span>
                    )}
                  </div>
                  {project.completionPercentage != null && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  )}
                </div>

                {project.lifeArea && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.lifeArea.color }}
                    />
                    <span className="text-xs text-text-tertiary">{project.lifeArea.label}</span>
                  </div>
                )}
              </MikaCard>
            );
          })}
        </div>
      )}

      {formMode && (
        <ProjectFormModal
          mode={formMode}
          project={editingProject ?? undefined}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {aiDraftOpen && (
        <ProjectAiDraftModal
          onClose={() => setAiDraftOpen(false)}
          onSuccess={() => {
            setAiDraftOpen(false);
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />
      )}
    </div>
  );
}

function ProjectFormModal({
  mode,
  project,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  project?: ProjectListItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: lifeAreas = [] } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const [form, setForm] = useState({
    title: project?.title ?? '',
    description: project?.description ?? '',
    lifeAreaId: project?.lifeAreaId ?? lifeAreas[0]?.id ?? '',
    status: (project?.status ? String(project.status).toLowerCase() : 'active') as ProjectStatus,
    priority: project?.priority ?? 3,
    startDate: project?.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
    targetDate: project?.targetDate ? new Date(project.targetDate).toISOString().slice(0, 10) : '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  function updateForm(patch: Partial<typeof form>) {
    setFormError(null);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateProjectDto | UpdateProjectDto = {
        title: form.title,
        description: form.description || undefined,
        lifeAreaId: form.lifeAreaId,
        status: form.status,
        priority: form.priority as 1 | 2 | 3 | 4 | 5,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        targetDate: form.targetDate ? new Date(form.targetDate) : undefined,
        tags: [],
      };

      if (mode === 'edit' && project) {
        return projectsApi.update(project.id, payload);
      }

      return projectsApi.create(payload as CreateProjectDto);
    },
    onSuccess,
    onError: () => {
      setFormError('Não foi possível salvar o projeto. Tente novamente.');
    },
  });

  const isEdit = mode === 'edit';
  const canSubmit = form.title.trim() && form.lifeAreaId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <MikaCard className="max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl">
        <h2 className="mb-5 text-lg font-bold text-text-primary">
          {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Título *</Label>
            <Input
              autoFocus
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Nome do projeto"
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
              <Label className="mb-1.5">Status</Label>
              <select
                value={form.status}
                onChange={(e) => updateForm({ status: e.target.value as ProjectStatus })}
                className={SELECT_CLASS}
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            <div>
              <Label className="mb-1.5">Prioridade</Label>
              <select
                value={form.priority}
                onChange={(e) =>
                  updateForm({ priority: Number(e.target.value) as typeof form.priority })
                }
                className={SELECT_CLASS}
              >
                {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                  <option key={v} value={v}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Início</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => updateForm({ startDate: e.target.value })}
              />
            </div>

            <div>
              <Label className="mb-1.5">Meta</Label>
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
            {isEdit ? 'Salvar' : 'Criar projeto'}
          </Button>
        </div>
      </MikaCard>
    </div>
  );
}

function ProjectAiDraftModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: lifeAreas = [] } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<{ name: string; content: string } | null>(null);
  const [draft, setDraft] = useState<ProjectDraftDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    lifeAreaId: '',
    priority: 3,
    startDate: '',
    targetDate: '',
    tags: '',
  });
  const [tasks, setTasks] = useState<
    Array<{
      title: string;
      description: string;
      priority: number;
      dueAt: string;
      selected: boolean;
    }>
  >([]);

  useEffect(() => {
    if (!draft) return;
    const suggestedArea = lifeAreas.find((area) => area.slug === draft.project.lifeAreaSlug);
    const fallbackArea = suggestedArea ?? lifeAreas[0];

    setProjectForm({
      title: draft.project.title,
      description: draft.project.description ?? '',
      lifeAreaId: fallbackArea?.id ?? '',
      priority: draft.project.priority ?? 3,
      startDate: draft.project.startDate?.slice(0, 10) ?? '',
      targetDate: draft.project.targetDate?.slice(0, 10) ?? '',
      tags: draft.project.tags?.join(', ') ?? '',
    });
    setTasks(
      draft.tasks.map((task) => ({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority ?? 3,
        dueAt: task.dueAt?.slice(0, 10) ?? '',
        selected: true,
      })),
    );
  }, [draft, lifeAreas]);

  const draftMutation = useMutation({
    mutationFn: () => projectsApi.createDraft({
      prompt: prompt.trim() || undefined,
      file: file ?? undefined,
    }),
    onSuccess: (data) => {
      setFormError(null);
      setDraft(data);
    },
    onError: () => {
      setFormError('Não foi possível gerar o rascunho. Revise a entrada e tente novamente.');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => {
      const payload: CreateProjectFromDraftDto = {
        project: {
          title: projectForm.title.trim(),
          description: projectForm.description.trim() || undefined,
          lifeAreaId: projectForm.lifeAreaId,
          priority: projectForm.priority as 1 | 2 | 3 | 4 | 5,
          status: 'active',
          startDate: projectForm.startDate ? new Date(projectForm.startDate) : undefined,
          targetDate: projectForm.targetDate ? new Date(projectForm.targetDate) : undefined,
          tags: projectForm.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
        tasks: tasks
          .filter((task) => task.selected && task.title.trim())
          .map((task) => ({
            title: task.title.trim(),
            description: task.description.trim() || undefined,
            priority: task.priority as 1 | 2 | 3 | 4 | 5,
            dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
            contextTags: [],
          })),
      };
      return projectsApi.createFromDraft(payload);
    },
    onSuccess,
    onError: () => {
      setFormError('Não foi possível criar o projeto a partir do rascunho.');
    },
  });

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormError(null);
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const normalizedName = selectedFile.name.toLowerCase();
    if (!normalizedName.endsWith('.md') && !normalizedName.endsWith('.txt')) {
      setFormError('Use um arquivo .md ou .txt.');
      event.target.value = '';
      return;
    }

    setFile({ name: selectedFile.name, content: await selectedFile.text() });
  }

  function updateTask(index: number, patch: Partial<(typeof tasks)[number]>) {
    setTasks((prev) => prev.map((task, i) => (i === index ? { ...task, ...patch } : task)));
  }

  const canGenerate = Boolean(prompt.trim() || file);
  const canConfirm = Boolean(projectForm.title.trim() && projectForm.lifeAreaId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <MikaCard className="max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Criar projeto com Mika</h2>
            <p className="mt-1 text-sm text-text-tertiary">
              Transforme um prompt ou arquivo em um rascunho revisável.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!draft ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">Prompt</Label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                placeholder="Ex.: Quero organizar minha mudança para João Pessoa em novembro..."
                className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div>
              <Label className="mb-1.5">Arquivo opcional</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-sm text-text-tertiary transition-colors hover:border-accent hover:text-text-primary">
                <Upload className="h-4 w-4" />
                {file ? file.name : 'Selecionar .md ou .txt'}
                <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={() => draftMutation.mutate()}
                disabled={!canGenerate || draftMutation.isPending}
                className="flex-1 gap-2"
              >
                {draftMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar rascunho
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label className="mb-1.5">Título *</Label>
                <Input
                  value={projectForm.title}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label className="mb-1.5">Descrição</Label>
                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-input bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>

              <div>
                <Label className="mb-1.5">Área de vida *</Label>
                <select
                  value={projectForm.lifeAreaId}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, lifeAreaId: event.target.value }))
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">Selecione</option>
                  {lifeAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1.5">Prioridade</Label>
                <select
                  value={projectForm.priority}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, priority: Number(event.target.value) }))
                  }
                  className={SELECT_CLASS}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1.5">Início</Label>
                <Input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, startDate: event.target.value }))
                  }
                />
              </div>

              <div>
                <Label className="mb-1.5">Meta</Label>
                <Input
                  type="date"
                  value={projectForm.targetDate}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, targetDate: event.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label className="mb-1.5">Tags</Label>
                <Input
                  value={projectForm.tags}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, tags: event.target.value }))
                  }
                  placeholder="mudança, família, planejamento"
                />
              </div>
            </div>

            {draft.milestones.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Marcos sugeridos</h3>
                <div className="space-y-2">
                  {draft.milestones.map((milestone, index) => (
                    <div key={`${milestone.title}-${index}`} className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-sm font-medium text-text-primary">{milestone.title}</p>
                      {milestone.description && (
                        <p className="mt-1 text-xs text-text-tertiary">{milestone.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Tarefas sugeridas</h3>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-sm text-text-tertiary">Nenhuma tarefa sugerida.</p>
                ) : (
                  tasks.map((task, index) => (
                    <div key={index} className="rounded-lg border border-border bg-surface p-3">
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.selected}
                          onChange={(event) => updateTask(index, { selected: event.target.checked })}
                          className="h-4 w-4"
                          aria-label="Selecionar tarefa"
                        />
                        <Input
                          value={task.title}
                          onChange={(event) => updateTask(index, { title: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_120px_150px]">
                        <Input
                          value={task.description}
                          onChange={(event) => updateTask(index, { description: event.target.value })}
                          placeholder="Descrição"
                        />
                        <select
                          value={task.priority}
                          onChange={(event) =>
                            updateTask(index, { priority: Number(event.target.value) })
                          }
                          className={SELECT_CLASS}
                        >
                          {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                            <option key={value} value={value}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="date"
                          value={task.dueAt}
                          onChange={(event) => updateTask(index, { dueAt: event.target.value })}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {draft.events.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Eventos sugeridos</h3>
                <p className="text-sm text-text-tertiary">
                  Eventos aparecem como sugestão neste incremento e serão persistidos em uma evolução da M8.
                </p>
              </div>
            )}

            {draft.warnings.length > 0 && (
              <div className="rounded-lg border border-attention/30 bg-attention/10 p-3 text-sm text-attention">
                {draft.warnings.join(' ')}
              </div>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setDraft(null)} className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={() => confirmMutation.mutate()}
                disabled={!canConfirm || confirmMutation.isPending}
                className="flex-1 gap-2"
              >
                {confirmMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar projeto
              </Button>
            </div>
          </div>
        )}
      </MikaCard>
    </div>
  );
}

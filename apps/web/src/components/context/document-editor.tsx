'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Archive,
  Trash2,
  History,
  X,
} from 'lucide-react';
import {
  contextApi,
  type ContextDocumentItem,
  type ContextDocumentVersionItem,
} from '@/lib/api-client';
import {
  CATEGORIA_LABELS,
  CAMADA_MEMORIA_LABELS,
  PRIVACIDADE_LABELS,
} from '@/lib/context-labels';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const selectClassName =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm w-full';

type Props = {
  documentId: string;
};

export function DocumentEditor({ documentId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [category, setCategory] = useState('LIFE');
  const [memoryType, setMemoryType] = useState('FIXED');
  const [privacyLevel, setPrivacyLevel] = useState('PRIVATE');
  const [enabledForRag, setEnabledForRag] = useState(true);
  const [originalMeta, setOriginalMeta] = useState({
    title: '',
    category: '',
    memoryType: '',
    privacyLevel: '',
    enabledForRag: true,
  });
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [viewVersion, setViewVersion] = useState<ContextDocumentVersionItem | null>(
    null,
  );

  const { data: doc, isLoading } = useQuery({
    queryKey: ['context-document', documentId],
    queryFn: () => contextApi.getDocument(documentId),
  });

  const { data: versions } = useQuery({
    queryKey: ['context-versions', documentId],
    queryFn: () => contextApi.getVersions(documentId),
  });

  useEffect(() => {
    if (!doc) return;
    const text = doc.currentVersion?.content ?? '';
    setTitle(doc.title);
    setContent(text);
    setOriginalContent(text);
    setCategory(doc.category);
    setMemoryType(doc.memoryType);
    setPrivacyLevel(doc.privacyLevel);
    setEnabledForRag(doc.enabledForRag);
    setOriginalMeta({
      title: doc.title,
      category: doc.category,
      memoryType: doc.memoryType,
      privacyLevel: doc.privacyLevel,
      enabledForRag: doc.enabledForRag,
    });
  }, [doc]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const contentChanged = content !== originalContent;
      const metaChanged =
        title !== originalMeta.title ||
        category !== originalMeta.category ||
        memoryType !== originalMeta.memoryType ||
        privacyLevel !== originalMeta.privacyLevel ||
        enabledForRag !== originalMeta.enabledForRag;

      if (contentChanged) {
        await contextApi.reimportDocument(documentId, content);
      }
      if (metaChanged) {
        await contextApi.updateDocument(documentId, {
          title,
          category,
          memoryType,
          privacyLevel,
          enabledForRag,
        });
      }
    },
    onSuccess: () => {
      setSaveFeedback('Documento salvo.');
      queryClient.invalidateQueries({ queryKey: ['context-document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['context-versions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['context-documents'] });
      queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });
      setOriginalContent(content);
      setOriginalMeta({ title, category, memoryType, privacyLevel, enabledForRag });
    },
    onError: () => setSaveFeedback('Falha ao salvar. Tente novamente.'),
  });

  const reimportFile = useMutation({
    mutationFn: (file: File) =>
      file.text().then((text) => contextApi.reimportDocument(documentId, text)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['context-document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['context-versions', documentId] });
      setSaveFeedback('Nova versão importada.');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (archived: boolean) =>
      contextApi.updateDocument(documentId, { archived }),
    onSuccess: () => router.push('/context'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => contextApi.deleteDocument(documentId),
    onSuccess: () => router.push('/context'),
  });

  const loadVersion = useMutation({
    mutationFn: (versionId: string) =>
      contextApi.getVersion(documentId, versionId),
    onSuccess: (version) => setViewVersion(version),
  });

  function handleFileReimport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) reimportFile.mutate(file);
    e.target.value = '';
  }

  function handleArchive() {
    const isArchived = Boolean((doc as ContextDocumentItem)?.archivedAt);
    if (
      window.confirm(
        isArchived ? 'Restaurar este documento?' : 'Arquivar este documento?',
      )
    ) {
      archiveMutation.mutate(!isArchived);
    }
  }

  function handleDelete() {
    if (
      window.confirm(
        `Excluir "${title}" e todos os trechos associados? Esta ação não pode ser desfeita.`,
      )
    ) {
      deleteMutation.mutate();
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  if (!doc) {
    return (
      <MikaCard className="p-8 text-center">
        <p className="text-text-tertiary">Documento não encontrado.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/context')}>
          Voltar
        </Button>
      </MikaCard>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title || 'Documento'}
        description="Edite o conteúdo e metadados do seu contexto pessoal."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/context')}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-1.5"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        }
      />

      {saveFeedback && (
        <div className="rounded-xl border border-progress/30 bg-progress/10 px-4 py-3 text-sm">
          {saveFeedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <MikaCard className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="edit-title" className="text-xs text-text-tertiary">
                Título
              </label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-category" className="text-xs text-text-tertiary">
                Categoria
              </label>
              <select
                id="edit-category"
                className={selectClassName}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.entries(CATEGORIA_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-memory-type" className="text-xs text-text-tertiary">
                Camada de memória
              </label>
              <select
                id="edit-memory-type"
                className={selectClassName}
                value={memoryType}
                onChange={(e) => setMemoryType(e.target.value)}
              >
                {Object.entries(CAMADA_MEMORIA_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-privacy" className="text-xs text-text-tertiary">
                Privacidade
              </label>
              <select
                id="edit-privacy"
                className={selectClassName}
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
              >
                {Object.entries(PRIVACIDADE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={enabledForRag}
                  onChange={(e) => setEnabledForRag(e.target.checked)}
                />
                Usar no chat (RAG)
              </label>
            </div>
          </MikaCard>

          <textarea
            className={cn(
              'min-h-[420px] w-full rounded-2xl border border-border bg-surface p-4',
              'font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30',
            )}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva seu contexto em markdown…"
          />

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt,text/markdown,text/plain"
              className="hidden"
              onChange={handleFileReimport}
              aria-label="Importar nova versão"
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={reimportFile.isPending}
              onClick={() => fileRef.current?.click()}
            >
              {reimportFile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Importar nova versão
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
              {(doc as ContextDocumentItem).archivedAt ? 'Restaurar' : 'Arquivar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <aside>
          <MikaCard className="p-4">
            <div className="mb-3 flex items-center gap-2 font-medium">
              <History className="h-4 w-4" />
              Histórico de versões
            </div>
            {!versions?.length ? (
              <p className="text-sm text-text-tertiary">Nenhuma versão ainda.</p>
            ) : (
              <ul className="space-y-2">
                {versions.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-secondary"
                      onClick={() => loadVersion.mutate(v.id)}
                    >
                      v{v.versionNumber}
                      <span className="ml-2 text-xs text-text-tertiary">
                        {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </MikaCard>
        </aside>
      </div>

      {viewVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Versão ${viewVersion.versionNumber}`}
        >
          <MikaCard className="max-h-[80vh] w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-medium">
                Versão {viewVersion.versionNumber} (somente leitura)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewVersion(null)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <pre className="max-h-[60vh] overflow-auto p-4 text-sm whitespace-pre-wrap">
              {viewVersion.content}
            </pre>
          </MikaCard>
        </div>
      )}
    </div>
  );
}

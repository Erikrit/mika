'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FilePlus, Loader2, Shield } from 'lucide-react';
import { contextApi, memoryApi } from '@/lib/api-client';
import type { ContextTemplate } from '@/lib/context-templates';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplatePicker } from './template-picker';
import { ImportPanel } from './import-panel';
import { DocumentList } from './document-list';
import { AdvancedPanel } from './advanced-panel';

type MainTab = 'perfil' | 'avancado';

export function ContextHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState<MainTab>('perfil');
  const [showArchived, setShowArchived] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ['context-documents', showArchived],
    queryFn: () => contextApi.listDocuments(showArchived),
    enabled: mainTab === 'perfil',
  });

  const createFromTemplate = useMutation({
    mutationFn: (template: ContextTemplate) =>
      contextApi.createDocument({
        title: template.title,
        content: template.content,
        category: template.category,
        memoryType: template.memoryType,
        privacyLevel: template.privacyLevel,
        enabledForRag: template.enabledForRag,
        source: 'manual',
      }),
    onMutate: (template) => setPendingTemplateId(template.id),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['context-documents'] });
      router.push(`/context/${doc.id}`);
    },
    onSettled: () => setPendingTemplateId(null),
  });

  const createBlank = useMutation({
    mutationFn: () =>
      contextApi.createDocument({
        title: 'Novo documento',
        content: '# Título\n\nEscreva aqui quem você é e o que importa para você.',
        category: 'CUSTOM',
        memoryType: 'EVOLUTIVE',
        privacyLevel: 'PRIVATE',
        source: 'manual',
      }),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['context-documents'] });
      router.push(`/context/${doc.id}`);
    },
  });

  const importMutation = useMutation({
    mutationFn: ({
      file,
      meta,
    }: {
      file: File;
      meta: {
        title: string;
        category: string;
        memoryType: string;
        privacyLevel: string;
      };
    }) =>
      memoryApi.importMarkdown(file, {
        title: meta.title,
        category: meta.category,
        memoryType: meta.memoryType,
        privacyLevel: meta.privacyLevel,
      }),
    onSuccess: (result: { imported: number; documentId?: string }) => {
      const docRef = result.documentId
        ? ` Documento: ${result.documentId.slice(0, 8)}…`
        : '';
      setImportFeedback({
        type: 'success',
        message: `${result.imported} trecho(s) enviado(s) para indexação.${docRef}`,
      });
      queryClient.invalidateQueries({ queryKey: ['context-documents'] });
      queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });
      queryClient.invalidateQueries({ queryKey: ['memory-health'] });
    },
    onError: () => {
      setImportFeedback({
        type: 'error',
        message: 'Falha ao importar. Use arquivo .md ou .txt.',
      });
    },
  });

  const toggleDocRag = useMutation({
    mutationFn: ({ id, enabledForRag }: { id: string; enabledForRag: boolean }) =>
      contextApi.updateDocument(id, { enabledForRag }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['context-documents'] }),
  });

  const archiveDoc = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      contextApi.updateDocument(id, { archived }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['context-documents'] }),
  });

  const deleteDoc = useMutation({
    mutationFn: (id: string) => contextApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['context-documents'] });
      queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });
    },
  });

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir "${title}" e todos os trechos associados?`)) return;
    deleteDoc.mutate(id);
  }

  const mainTabs: { id: MainTab; label: string }[] = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'avancado', label: 'Avançado' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contexto"
        description="Conte quem você é para a Mika conversar de forma mais adequada a você."
        action={
          mainTab === 'perfil' ? (
            <Button
              onClick={() => createBlank.mutate()}
              disabled={createBlank.isPending}
              className="gap-2"
            >
              {createBlank.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FilePlus className="h-4 w-4" />
              )}
              Novo documento em branco
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {mainTabs.map(({ id, label }) => (
          <Button
            key={id}
            variant={mainTab === id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMainTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {mainTab === 'perfil' && (
        <div className="space-y-8">
          <TemplatePicker
            onSelect={(t) => createFromTemplate.mutate(t)}
            isPending={createFromTemplate.isPending}
            pendingId={pendingTemplateId}
          />

          <ImportPanel
            onImport={(file, meta) => {
              setImportFeedback(null);
              importMutation.mutate({ file, meta });
            }}
            isPending={importMutation.isPending}
            feedback={importFeedback}
          />

          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">Seus documentos</h3>
            <label className="flex items-center gap-2 text-sm text-text-tertiary">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              Mostrar arquivados
            </label>
          </div>

          {docsLoading ? (
            <Skeleton className="h-32 rounded-2xl" />
          ) : !documents?.length ? (
            <MikaCard className="flex flex-col items-center py-16 text-center">
              <Shield className="mb-3 h-10 w-10 text-text-tertiary" />
              <p className="text-text-tertiary">
                Comece com um modelo ou importe um documento para a Mika te conhecer melhor.
              </p>
            </MikaCard>
          ) : (
            <DocumentList
              documents={documents}
              onToggleRag={(id, enabledForRag) =>
                toggleDocRag.mutate({ id, enabledForRag })
              }
              onArchive={(id, archived) => archiveDoc.mutate({ id, archived })}
              onDelete={handleDelete}
              ragPending={toggleDocRag.isPending}
            />
          )}
        </div>
      )}

      {mainTab === 'avancado' && <AdvancedPanel />}
    </div>
  );
}

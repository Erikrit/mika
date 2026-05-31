'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Activity, ScrollText, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { memoryApi } from '@/lib/api-client';
import {
  CAMADA_MEMORIA_LABELS,
  PRIVACIDADE_LABELS,
  labelCamadaMemoria,
  labelCanalAuditoria,
  labelOrigemChunk,
  labelPrivacidade,
  labelRag,
} from '@/lib/context-labels';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type AdvancedTab = 'chunks' | 'health' | 'audit';

const selectClassName =
  'rounded-lg border border-border bg-surface px-2 py-1 text-xs';

const TAB_COPY: Record<AdvancedTab, { title: string; description: string }> = {
  chunks: {
    title: 'Trechos',
    description:
      'Pedaços indexados para busca — normalmente você não precisa editar aqui.',
  },
  health: {
    title: 'Saúde',
    description: 'Diagnóstico da memória (duplicatas, órfãos).',
  },
  audit: {
    title: 'Auditoria',
    description: 'Registro de quando memória sensível entrou numa conversa.',
  },
};

export function AdvancedPanel() {
  const [tab, setTab] = useState<AdvancedTab>('chunks');
  const queryClient = useQueryClient();

  const { data: chunks, isLoading: chunksLoading, refetch: refetchChunks } = useQuery({
    queryKey: ['memory-chunks'],
    queryFn: () => memoryApi.listChunks(),
    enabled: tab === 'chunks',
  });

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['memory-health'],
    queryFn: () => memoryApi.getHealth(),
    enabled: tab === 'health',
  });

  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ['memory-audit'],
    queryFn: () => memoryApi.listAudit(),
    enabled: tab === 'audit',
  });

  const updateChunk = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => memoryApi.updateChunk(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memory-chunks'] }),
  });

  const deleteChunk = useMutation({
    mutationFn: (id: string) => memoryApi.deleteChunk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });
      queryClient.invalidateQueries({ queryKey: ['memory-health'] });
    },
  });

  const tabs: { id: AdvancedTab; icon: typeof Brain; label: string }[] = [
    { id: 'chunks', icon: Brain, label: 'Trechos' },
    { id: 'health', icon: Activity, label: 'Saúde' },
    { id: 'audit', icon: ScrollText, label: 'Auditoria' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={tab === id ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setTab(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-text-tertiary">{TAB_COPY[tab].description}</p>

      {tab === 'chunks' && (
        <>
          {chunksLoading ? (
            <Skeleton className="h-32 rounded-2xl" />
          ) : !chunks?.length ? (
            <MikaCard className="flex flex-col items-center py-16 text-center">
              <Brain className="mb-3 h-10 w-10 text-text-tertiary" />
              <p className="text-text-tertiary">
                Nenhum trecho indexado. Crie ou importe um documento na aba Perfil.
              </p>
            </MikaCard>
          ) : (
            <div className="space-y-3">
              {chunks.map((chunk) => (
                <MikaCard key={chunk.id} className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                    <span className="rounded-full bg-surface-secondary px-2 py-0.5">
                      {chunk.memoryType
                        ? labelCamadaMemoria(chunk.memoryType)
                        : labelOrigemChunk(chunk.sourceType)}
                    </span>
                    {chunk.document && <span>{chunk.document.title}</span>}
                    <select
                      className={selectClassName}
                      value={chunk.memoryType ?? 'EVOLUTIVE'}
                      aria-label="Camada do trecho"
                      onChange={(e) =>
                        updateChunk.mutate({
                          id: chunk.id,
                          data: { memoryType: e.target.value },
                        })
                      }
                    >
                      {Object.entries(CAMADA_MEMORIA_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <select
                      className={selectClassName}
                      value={chunk.privacyLevel ?? 'PRIVATE'}
                      aria-label="Privacidade do trecho"
                      onChange={(e) =>
                        updateChunk.mutate({
                          id: chunk.id,
                          data: { privacyLevel: e.target.value },
                        })
                      }
                    >
                      {Object.entries(PRIVACIDADE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 px-2"
                      aria-label="Alternar uso deste trecho no chat"
                      onClick={() =>
                        updateChunk.mutate({
                          id: chunk.id,
                          data: { enabledForRag: !(chunk.enabledForRag ?? true) },
                        })
                      }
                    >
                      {labelRag(chunk.enabledForRag !== false)}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-destructive hover:text-destructive"
                      aria-label="Excluir trecho"
                      onClick={() => {
                        if (window.confirm('Excluir este trecho da memória?')) {
                          deleteChunk.mutate(chunk.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="line-clamp-4 text-sm">{chunk.content}</p>
                </MikaCard>
              ))}
              <Button variant="link" size="sm" onClick={() => refetchChunks()}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Atualizar lista
              </Button>
            </div>
          )}
        </>
      )}

      {tab === 'health' && (
        <MikaCard className="p-6">
          {healthLoading ? (
            <Skeleton className="h-24" />
          ) : health ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs text-text-tertiary">Total de trechos</dt>
                <dd className="text-2xl font-semibold">{health.totalChunks}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">Documentos</dt>
                <dd className="text-2xl font-semibold">{health.totalDocuments}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">Duplicatas</dt>
                <dd className="text-2xl font-semibold">{health.duplicates}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">Trechos órfãos</dt>
                <dd className="text-2xl font-semibold">{health.orphans}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">Com RAG desligado</dt>
                <dd className="text-2xl font-semibold">{health.disabledForRag}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-tertiary">
                  Fixa / Evolutiva / Sensível
                </dt>
                <dd className="text-sm">
                  {health.byMemoryType.FIXED} / {health.byMemoryType.EVOLUTIVE} /{' '}
                  {health.byMemoryType.SENSITIVE}
                </dd>
              </div>
            </dl>
          ) : null}
        </MikaCard>
      )}

      {tab === 'audit' && (
        <MikaCard className="p-4">
          {auditLoading ? (
            <Skeleton className="h-24" />
          ) : !audit?.items?.length ? (
            <p className="text-sm text-text-tertiary">
              Nenhum uso de memória sensível registrado.
            </p>
          ) : (
            <div className="space-y-2">
              {audit.items.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg bg-surface-secondary p-3 text-sm"
                >
                  <span className="text-xs text-text-tertiary">
                    {labelCanalAuditoria(entry.channel)} ·{' '}
                    {new Date(entry.createdAt).toLocaleString('pt-BR')}
                  </span>
                  <p className="mt-1 line-clamp-2">{entry.chunk?.content}</p>
                </div>
              ))}
            </div>
          )}
        </MikaCard>
      )}

      {updateChunk.isPending && (
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
        </div>
      )}
    </div>
  );
}

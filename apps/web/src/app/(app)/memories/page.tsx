'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Upload, Search, Loader2, RefreshCw } from 'lucide-react';
import { memoryApi, lifeAreasApi } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ImportResult = { imported: number; queued?: boolean; sourceId?: string };

export default function MemoriesPage() {
  const [lifeAreaFilter, setLifeAreaFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[] | null>(null);
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [pollingHint, setPollingHint] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: lifeAreas } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const { data: chunks, isLoading, refetch } = useQuery({
    queryKey: ['memory-chunks', lifeAreaFilter],
    queryFn: () => memoryApi.listChunks(lifeAreaFilter || undefined),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) =>
      memoryApi.importMarkdown(file, lifeAreaFilter || undefined),
    onSuccess: (result: ImportResult) => {
      const msg =
        result.queued === false
          ? `${result.imported} chunk(s) importado(s).`
          : `${result.imported} chunk(s) enviado(s) para indexação. Aguarde alguns segundos.`;
      setImportFeedback({ type: 'success', message: msg });
      queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });

      let attempts = 0;
      const poll = setInterval(() => {
        attempts += 1;
        queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });
        if (attempts >= 3) clearInterval(poll);
      }, 5000);
    },
    onError: () => {
      setImportFeedback({
        type: 'error',
        message: 'Falha ao importar o arquivo. Verifique o formato (.md) e tente novamente.',
      });
    },
  });

  useEffect(() => {
    if (!importFeedback || importFeedback.type !== 'success') return;
    if (chunks && chunks.length > 0) {
      setPollingHint(false);
      return;
    }
    const timer = setTimeout(() => setPollingHint(true), 30_000);
    return () => clearTimeout(timer);
  }, [importFeedback, chunks]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await memoryApi.search(
      searchQuery,
      lifeAreaFilter || undefined,
    );
    setSearchResults(results as unknown[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFeedback(null);
      setPollingHint(false);
      importMutation.mutate(file);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Memórias"
        description="Segundo cérebro — chunks indexados e busca semântica"
        action={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".md,text/markdown"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importMutation.isPending}
              className="gap-2"
            >
              {importMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Importar .md
            </Button>
          </>
        }
      />

      {importFeedback && (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            importFeedback.type === 'success'
              ? 'border-progress/30 bg-progress/10 text-text-primary'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          )}
        >
          {importFeedback.message}
        </div>
      )}

      {pollingHint && (!chunks || chunks.length === 0) && (
        <div className="rounded-xl border border-insight/30 bg-insight/5 px-4 py-3 text-sm text-text-secondary">
          A indexação pode levar alguns segundos. Se os chunks não aparecerem, verifique se o worker
          está rodando:{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs">
            pnpm --filter worker dev
          </code>
          <Button
            variant="link"
            size="sm"
            className="ml-2 h-auto p-0"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Atualizar
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={lifeAreaFilter === '' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setLifeAreaFilter('')}
        >
          Todas
        </Button>
        {lifeAreas?.map((area) => (
          <Button
            key={area.id}
            variant={lifeAreaFilter === area.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setLifeAreaFilter(area.id)}
          >
            {area.label}
          </Button>
        ))}
      </div>

      <MikaCard className="space-y-3 p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar na memória..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} className="gap-2 shrink-0">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
        {searchResults && (
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">
              {searchResults.length} resultado(s)
            </p>
            {(searchResults as Array<{ content: string; sourceType: string; finalScore?: number }>).map(
              (r, i) => (
                <div key={i} className="rounded-xl bg-surface-secondary p-3">
                  <span className="text-xs text-text-tertiary">
                    {r.sourceType}
                    {r.finalScore != null && ` · score ${r.finalScore.toFixed(2)}`}
                  </span>
                  <p className="mt-1 line-clamp-4">{r.content}</p>
                </div>
              ),
            )}
          </div>
        )}
      </MikaCard>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : chunks?.length === 0 ? (
        <MikaCard className="flex flex-col items-center py-16 text-center">
          <Brain className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-text-tertiary">
            Nenhum chunk indexado ainda. Crie projetos ou importe notas .md.
          </p>
        </MikaCard>
      ) : (
        <div className="space-y-3">
          {chunks?.map((chunk) => (
            <MikaCard key={chunk.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                <span className="rounded-full bg-surface-secondary px-2 py-0.5">
                  {chunk.sourceType}
                </span>
                {chunk.lifeArea && (
                  <span>{chunk.lifeArea.label}</span>
                )}
                <span>
                  {new Date(chunk.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="line-clamp-6 text-sm">{chunk.content}</p>
            </MikaCard>
          ))}
        </div>
      )}
    </div>
  );
}

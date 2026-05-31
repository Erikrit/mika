'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Upload, Search, Loader2 } from 'lucide-react';
import { memoryApi, lifeAreasApi } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemoriesPage() {
  const [lifeAreaFilter, setLifeAreaFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: lifeAreas } = useQuery({
    queryKey: ['life-areas'],
    queryFn: lifeAreasApi.list,
  });

  const { data: chunks, isLoading } = useQuery({
    queryKey: ['memory-chunks', lifeAreaFilter],
    queryFn: () => memoryApi.listChunks(lifeAreaFilter || undefined),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) =>
      memoryApi.importMarkdown(file, lifeAreaFilter || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-chunks'] });
    },
  });

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
    if (file) importMutation.mutate(file);
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

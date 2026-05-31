'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CATEGORIA_LABELS,
  CAMADA_MEMORIA_LABELS,
  PRIVACIDADE_LABELS,
} from '@/lib/context-labels';
import { cn } from '@/lib/utils';

const selectClassName =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm w-full';

type ImportMeta = {
  title: string;
  category: string;
  memoryType: string;
  privacyLevel: string;
};

type Props = {
  onImport: (file: File, meta: ImportMeta) => void;
  isPending?: boolean;
  feedback?: { type: 'success' | 'error'; message: string } | null;
};

export function ImportPanel({ onImport, isPending, feedback }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [meta, setMeta] = useState<ImportMeta>({
    title: '',
    category: 'LIFE',
    memoryType: 'FIXED',
    privacyLevel: 'PRIVATE',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const title = meta.title || file.name.replace(/\.(md|txt)$/i, '');
    onImport(file, { ...meta, title });
    e.target.value = '';
  };

  return (
    <MikaCard className="space-y-4 p-4">
      <div>
        <h3 className="font-medium">Importar arquivo</h3>
        <p className="mt-1 text-sm text-text-tertiary">
          Envie um arquivo .md ou .txt com metadados antes do upload.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="import-title" className="text-xs text-text-tertiary">
            Título
          </label>
          <Input
            id="import-title"
            placeholder="Título do documento"
            value={meta.title}
            onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="import-category" className="text-xs text-text-tertiary">
            Categoria
          </label>
          <select
            id="import-category"
            className={selectClassName}
            value={meta.category}
            onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value }))}
          >
            {Object.entries(CATEGORIA_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="import-memory-type" className="text-xs text-text-tertiary">
            Camada de memória
          </label>
          <select
            id="import-memory-type"
            className={selectClassName}
            value={meta.memoryType}
            onChange={(e) => setMeta((m) => ({ ...m, memoryType: e.target.value }))}
          >
            {Object.entries(CAMADA_MEMORIA_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="import-privacy" className="text-xs text-text-tertiary">
            Privacidade
          </label>
          <select
            id="import-privacy"
            className={selectClassName}
            value={meta.privacyLevel}
            onChange={(e) => setMeta((m) => ({ ...m, privacyLevel: e.target.value }))}
          >
            {Object.entries(PRIVACIDADE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".md,.txt,text/markdown,text/plain"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Selecionar arquivo para importar"
      />

      <Button
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
        className="gap-2"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Selecionar arquivo
      </Button>

      {feedback && (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            feedback.type === 'success'
              ? 'border-progress/30 bg-progress/10'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          )}
        >
          {feedback.message}
        </div>
      )}
    </MikaCard>
  );
}

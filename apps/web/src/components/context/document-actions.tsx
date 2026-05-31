'use client';

import Link from 'next/link';
import { Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { labelRag } from '@/lib/context-labels';
import type { ContextDocumentItem } from '@/lib/api-client';

type Props = {
  doc: ContextDocumentItem;
  onToggleRag: (id: string, enabledForRag: boolean) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string, title: string) => void;
  ragPending?: boolean;
};

export function DocumentActions({
  doc,
  onToggleRag,
  onArchive,
  onDelete,
  ragPending,
}: Props) {
  const isArchived = Boolean(doc.archivedAt);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/context/${doc.id}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 text-sm hover:bg-surface-secondary"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </Link>
      <Button
        size="sm"
        variant={doc.enabledForRag ? 'secondary' : 'outline'}
        disabled={ragPending}
        aria-label={`Alternar uso no chat para ${doc.title}`}
        onClick={() => onToggleRag(doc.id, !doc.enabledForRag)}
      >
        {labelRag(doc.enabledForRag)}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5"
        onClick={() => onArchive(doc.id, !isArchived)}
      >
        {isArchived ? (
          <>
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restaurar
          </>
        ) : (
          <>
            <Archive className="h-3.5 w-3.5" />
            Arquivar
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 text-destructive hover:text-destructive"
        onClick={() => onDelete(doc.id, doc.title)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Excluir
      </Button>
    </div>
  );
}

'use client';

import { MikaCard } from '@/components/ui/mika-card';
import {
  labelCamadaMemoria,
  labelCategoria,
  labelPrivacidade,
} from '@/lib/context-labels';
import type { ContextDocumentItem } from '@/lib/api-client';
import { DocumentActions } from './document-actions';

type Props = {
  documents: ContextDocumentItem[];
  onToggleRag: (id: string, enabledForRag: boolean) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string, title: string) => void;
  ragPending?: boolean;
};

function DocumentCard({
  doc,
  onToggleRag,
  onArchive,
  onDelete,
  ragPending,
}: {
  doc: ContextDocumentItem;
  onToggleRag: Props['onToggleRag'];
  onArchive: Props['onArchive'];
  onDelete: Props['onDelete'];
  ragPending?: boolean;
}) {
  return (
    <MikaCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{doc.title}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-tertiary">
            <span className="rounded-full bg-surface-secondary px-2 py-0.5">
              {labelCategoria(doc.category)}
            </span>
            <span className="rounded-full bg-surface-secondary px-2 py-0.5">
              {labelCamadaMemoria(doc.memoryType)}
            </span>
            <span className="rounded-full bg-surface-secondary px-2 py-0.5">
              {labelPrivacidade(doc.privacyLevel)}
            </span>
            {doc.currentVersion && (
              <span>versão {doc.currentVersion.versionNumber}</span>
            )}
            <span>{doc._count?.chunks ?? 0} trecho(s)</span>
            {doc.archivedAt && (
              <span className="text-amber-600">Arquivado</span>
            )}
          </div>
        </div>
        <DocumentActions
          doc={doc}
          onToggleRag={onToggleRag}
          onArchive={onArchive}
          onDelete={onDelete}
          ragPending={ragPending}
        />
      </div>
    </MikaCard>
  );
}

export function DocumentList({
  documents,
  onToggleRag,
  onArchive,
  onDelete,
  ragPending,
}: Props) {
  const fixed = documents.filter((d) => d.memoryType === 'FIXED');
  const rest = documents.filter((d) => d.memoryType !== 'FIXED');

  return (
    <div className="space-y-6">
      {fixed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary">
            Como a Mika te conhece
          </h2>
          {fixed.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onToggleRag={onToggleRag}
              onArchive={onArchive}
              onDelete={onDelete}
              ragPending={ragPending}
            />
          ))}
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary">
            Seu contexto
          </h2>
          {rest.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onToggleRag={onToggleRag}
              onArchive={onArchive}
              onDelete={onDelete}
              ragPending={ragPending}
            />
          ))}
        </section>
      )}
    </div>
  );
}

'use client';

import { FileText, Loader2 } from 'lucide-react';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { CONTEXT_TEMPLATES, type ContextTemplate } from '@/lib/context-templates';

type Props = {
  onSelect: (template: ContextTemplate) => void;
  isPending?: boolean;
  pendingId?: string | null;
};

export function TemplatePicker({ onSelect, isPending, pendingId }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">Começar com modelo</h3>
        <p className="mt-1 text-sm text-text-tertiary">
          Escolha um modelo guiado para contar quem você é à Mika.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {CONTEXT_TEMPLATES.map((template) => (
          <MikaCard key={template.id} className="flex flex-col p-4">
            <FileText className="mb-2 h-8 w-8 text-primary" />
            <h4 className="font-medium">{template.title}</h4>
            <p className="mt-1 flex-1 text-sm text-text-tertiary">
              {template.description}
            </p>
            <Button
              size="sm"
              className="mt-4 w-full"
              disabled={isPending}
              onClick={() => onSelect(template)}
            >
              {isPending && pendingId === template.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Usar modelo'
              )}
            </Button>
          </MikaCard>
        ))}
      </div>
    </div>
  );
}

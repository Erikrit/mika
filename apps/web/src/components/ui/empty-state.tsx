import Link from 'next/link';
import { Plus } from 'lucide-react';

type EmptyStateProps = {
  message: string;
  action?: { label: string; href: string };
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <p className="text-sm text-text-tertiary">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-3 flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors duration-200"
        >
          <Plus className="h-3 w-3" />
          {action.label}
        </Link>
      )}
    </div>
  );
}

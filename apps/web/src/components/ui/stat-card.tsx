import { cn } from '@/lib/utils';
import { MikaCard } from '@/components/ui/mika-card';

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  variant?: 'accent' | 'progress' | 'critical' | 'insight';
  alert?: boolean;
};

const variantStyles = {
  accent: 'border-accent/30 bg-accent/5',
  progress: 'border-progress/30 bg-progress/5',
  critical: 'border-critical/30 bg-critical/5',
  insight: 'border-insight/30 bg-insight/5',
};

export function StatCard({ icon, label, value, variant = 'accent', alert }: StatCardProps) {
  return (
    <MikaCard
      className={cn(
        variantStyles[variant],
        alert && 'ring-1 ring-critical/50',
      )}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-surface p-2">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-sm text-text-tertiary">{label}</p>
        </div>
      </div>
    </MikaCard>
  );
}

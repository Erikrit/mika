import { cn } from '@/lib/utils';

type MikaAvatarProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function MikaAvatar({ size = 'md', className }: MikaAvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', sizes[size], className)}>
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-insight opacity-60 blur-md animate-breathe"
        aria-hidden
      />
      <div
        className="relative h-full w-full rounded-full bg-gradient-to-br from-accent/90 to-insight/70 shadow-lg shadow-accent/20 ring-1 ring-white/10"
        role="img"
        aria-label="Avatar da assistente Mika"
      >
        <div className="absolute inset-[25%] rounded-full bg-white/20 blur-sm" />
      </div>
    </div>
  );
}

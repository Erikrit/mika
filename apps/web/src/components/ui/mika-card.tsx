import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type MikaCardProps = React.ComponentProps<typeof Card> & {
  hover?: boolean;
};

function MikaCard({ className, hover = true, ...props }: MikaCardProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-border bg-surface p-6 shadow-sm ring-0',
        hover && 'transition-all duration-200 hover:border-border/80 hover:shadow-md',
        className,
      )}
      {...props}
    />
  );
}

function MikaCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('px-0 pt-0 pb-4', className)} {...props} />;
}

function MikaCardTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return <CardTitle className={cn('text-base font-semibold text-text-primary', className)} {...props} />;
}

function MikaCardDescription({ className, ...props }: React.ComponentProps<typeof CardDescription>) {
  return <CardDescription className={cn('text-text-tertiary', className)} {...props} />;
}

function MikaCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('px-0', className)} {...props} />;
}

function MikaCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return <CardFooter className={cn('px-0 pb-0 pt-4 bg-transparent border-border', className)} {...props} />;
}

export {
  MikaCard,
  MikaCardHeader,
  MikaCardTitle,
  MikaCardDescription,
  MikaCardContent,
  MikaCardFooter,
};

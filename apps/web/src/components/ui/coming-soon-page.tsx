import { MikaAvatar } from '@/components/ui/mika-avatar';
import { MikaCard } from '@/components/ui/mika-card';
import { PageHeader } from '@/components/ui/page-header';
import type { LucideIcon } from 'lucide-react';

type ComingSoonPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />
      <MikaCard className="flex flex-col items-center py-16 text-center">
        <div className="mb-6 rounded-2xl bg-accent/10 p-4">
          <Icon className="h-8 w-8 text-accent" />
        </div>
        <MikaAvatar size="md" />
        <p className="mt-6 text-lg font-medium text-text-primary">Em breve</p>
        <p className="mt-2 max-w-md text-sm text-text-tertiary">
          Este módulo faz parte do seu Companion OS e será disponibilizado em uma próxima atualização.
        </p>
      </MikaCard>
    </div>
  );
}

import { BookOpen } from 'lucide-react';
import { ComingSoonPage } from '@/components/ui/coming-soon-page';

export default function StudiesPage() {
  return (
    <ComingSoonPage
      title="Estudos"
      description="Trilhas de aprendizado e materiais de estudo"
      icon={BookOpen}
    />
  );
}

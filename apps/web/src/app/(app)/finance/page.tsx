'use client';

import { TrendingUp } from 'lucide-react';
import { ComingSoonPage } from '@/components/ui/coming-soon-page';

export default function FinancePage() {
  return (
    <ComingSoonPage
      title="Finanças"
      description="Metas e objetivos financeiros"
      icon={TrendingUp}
    />
  );
}

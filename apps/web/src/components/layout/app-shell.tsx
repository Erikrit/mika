'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { AiHub, AiHubToggleFab } from '@/components/layout/ai-hub';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-primary">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto pl-14 md:pl-0">
          <div className="page-enter p-6 lg:p-8">{children}</div>
        </main>
        <AiHub />
      </div>
      <AiHubToggleFab />
    </div>
  );
}

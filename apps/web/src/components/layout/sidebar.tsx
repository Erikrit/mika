'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayout } from '@/contexts/layout-context';
import { cn } from '@/lib/utils';
import {
  Home,
  Brain,
  Target,
  BookOpen,
  TrendingUp,
  FolderOpen,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { MikaAvatar } from '@/components/ui/mika-avatar';

const NAV_ITEMS = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/memories', label: 'Memórias', icon: Brain },
  { href: '/goals', label: 'Objetivos', icon: Target },
  { href: '/studies', label: 'Estudos', icon: BookOpen },
  { href: '/finance', label: 'Finanças', icon: TrendingUp },
  { href: '/projects', label: 'Projetos', icon: FolderOpen },
  { href: '/events', label: 'Agenda', icon: Calendar },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-4 py-5">
        <MikaAvatar size="sm" />
        <div>
          <span className="text-lg font-bold text-text-primary">Mika</span>
          <p className="text-xs text-text-tertiary">Companion OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-transparent text-text-tertiary hover:bg-surface hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useLayout();

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-[4.25rem] z-50 rounded-lg bg-bg-secondary p-2 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {sidebarOpen ? <X className="h-5 w-5 text-text-primary" /> : <Menu className="h-5 w-5 text-text-primary" />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] w-60 flex-col transform border-r border-border bg-bg-secondary transition-transform duration-200 md:static md:top-0 md:z-auto md:h-full md:translate-x-0 md:flex-shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <NavContent onNavigate={() => setSidebarOpen(false)} />
      </aside>
    </>
  );
}

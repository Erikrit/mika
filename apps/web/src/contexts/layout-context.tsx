'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type LayoutContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  aiHubOpen: boolean;
  setAiHubOpen: (open: boolean) => void;
  toggleAiHub: () => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiHubOpen, setAiHubOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const update = () => setAiHubOpen(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const toggleAiHub = useCallback(() => setAiHubOpen((prev) => !prev), []);

  return (
    <LayoutContext.Provider
      value={{ sidebarOpen, setSidebarOpen, aiHubOpen, setAiHubOpen, toggleAiHub }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  chatApi,
  type ChatSessionItem,
} from '@/lib/api-client';

const LAST_SESSION_STORAGE_KEY = 'mika_web_chat_last_session_id';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatContextValue = {
  sessions: ChatSessionItem[];
  activeSessionId: string | undefined;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  selectSession: (id: string) => Promise<void>;
  startNewSession: () => void;
  sendMessage: (text: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function storeLastSessionId(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_SESSION_STORAGE_KEY, id);
  }
}

function readLastSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem(LAST_SESSION_STORAGE_KEY) ?? undefined;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const selectSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const items = await chatApi.getSessionMessages(id);
      setActiveSessionId(id);
      storeLastSessionId(id);
      setMessages(
        items.map((m) => ({ role: m.role, content: m.content })),
      );
    } catch {
      setError('Não foi possível carregar a conversa.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await chatApi.listSessions(1);
      const lastId = readLastSessionId();
      const ordered =
        lastId && list.some((s) => s.id === lastId)
          ? [...list].sort((a, b) => (a.id === lastId ? -1 : b.id === lastId ? 1 : 0))
          : list;
      setSessions(ordered);

      // MAINT-M4: sempre iniciar em "Nova conversa" ao abrir/voltar ao chat.
      setActiveSessionId(undefined);
      setMessages([]);
    } catch {
      setError('Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewSession = useCallback(() => {
    setActiveSessionId(undefined);
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || sending) return;

      setError(null);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: '' },
      ]);
      setSending(true);

      try {
        const result = await chatApi.streamMessage(
          message,
          activeSessionId,
          (token) => {
            setMessages((prev) => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              const last = next[lastIdx];
              if (last?.role === 'assistant') {
                next[lastIdx] = { ...last, content: last.content + token };
              }
              return next;
            });
          },
        );

        setActiveSessionId(result.sessionId);
        storeLastSessionId(result.sessionId);

        const list = await chatApi.listSessions(1);
        setSessions(list);
      } catch {
        setError('Não foi possível enviar a mensagem. Tente novamente.');
        setMessages((prev) => prev.slice(0, -2));
      } finally {
        setSending(false);
      }
    },
    [activeSessionId, sending],
  );

  useEffect(() => {
    if (user) {
      void loadSessions();
    } else {
      setSessions([]);
      setActiveSessionId(undefined);
      setMessages([]);
    }
  }, [user?.id, loadSessions]);

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        messages,
        loading,
        error,
        sending,
        selectSession,
        startNewSession,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}

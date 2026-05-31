'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, MessageCircle, User } from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateCode() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ code: string; expiresAt: string }>('/auth/telegram/code');
      setCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch {
      setError('Não foi possível gerar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Configurações" description="Gerencie sua conta e preferências" />

      <MikaCard>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-accent text-primary-foreground">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-text-primary">{user?.name}</p>
            <p className="text-sm text-text-tertiary">{user?.email}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-text-tertiary" />
              <h3 className="text-sm font-semibold text-text-primary">Vincular Telegram</h3>
            </div>
            <p className="mb-4 text-sm text-text-secondary">
              Conecte sua conta para usar o bot Telegram com chat inteligente e comandos personalizados.
            </p>
            <ol className="mb-4 list-inside list-decimal space-y-1 text-sm text-text-secondary">
              <li>Clique em &quot;Gerar código&quot; abaixo</li>
              <li>Abra o bot Mika no Telegram</li>
              <li>Envie: <code className="rounded bg-surface px-1">/vincular CODIGO</code></li>
            </ol>
            {code && (
              <div className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-4 text-center">
                <p className="text-xs text-text-tertiary">Seu código (válido por 10 min)</p>
                <p className="mt-1 text-3xl font-bold tracking-widest text-accent">{code}</p>
                {expiresAt && (
                  <p className="mt-1 text-xs text-text-tertiary">
                    Expira em {new Date(expiresAt).toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
            )}
            {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
            <Button onClick={generateCode} disabled={loading}>
              {loading ? 'Gerando...' : code ? 'Gerar novo código' : 'Gerar código'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <User className="h-4 w-4 text-text-tertiary" />
            <span>Perfil e preferências em breve</span>
          </div>

          <Button variant="destructive" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </MikaCard>
    </div>
  );
}

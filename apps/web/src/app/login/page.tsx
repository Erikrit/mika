'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { MikaAvatar } from '@/components/ui/mika-avatar';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number }; code?: string };
      if (!axiosErr.response && (axiosErr.code === 'ERR_NETWORK' || axiosErr.code === 'ECONNREFUSED')) {
        setError('Não foi possível conectar à API. Verifique se o backend está rodando (porta 3001).');
      } else if (axiosErr.response?.status === 400) {
        setError('Dados inválidos. Use o email erik@mika.local e senha com pelo menos 6 caracteres.');
      } else {
        setError('Email ou senha inválidos. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-insight/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm page-enter">
        <div className="mb-8 flex flex-col items-center text-center">
          <MikaAvatar size="lg" />
          <h1 className="mt-4 text-2xl font-bold text-text-primary">Mika</h1>
          <p className="text-sm text-text-tertiary">Seu Companion OS pessoal</p>
        </div>

        <MikaCard className="glass shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-text-primary">Entrar no sistema</h2>
          <p className="mb-5 text-sm text-text-tertiary">Acesse seu segundo cérebro digital</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1.5">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label className="mb-1.5">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-xs text-critical">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-4 rounded-lg bg-surface/50 p-3">
            <p className="text-center text-xs text-text-tertiary">
              Conta padrão: <span className="text-text-secondary">erik@mika.local</span>
            </p>
          </div>
        </MikaCard>
      </div>
    </div>
  );
}

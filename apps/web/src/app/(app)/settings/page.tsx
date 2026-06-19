'use client';

import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/ui/page-header';
import { MikaCard } from '@/components/ui/mika-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, User } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

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

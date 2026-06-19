# MAINT — Remoção definitiva Telegram (pós-M9 Web Push)

**Status:** Bloqueado — pré-requisito M9 (Web Push/PWA notifications)  
**Referência:** AD-017, `.cursor/plans/limpeza_legado_mika_c9dfe924.plan.md` Fase 6

---

## Objetivo

Remover código, schema e infra legados de Telegram após canal Web Push estar operacional na PWA.

---

## Pré-requisitos (gates)

- [ ] M9 implementado: lembretes e notificações via Web Push funcionando em UAT
- [ ] Período de deprecação de 30 dias com aviso em changelog/README
- [ ] Nenhum usuário ativo dependente de `telegramChatId` (ou migração de dados concluída)

---

## Escopo de remoção

| Item | Ação |
|------|------|
| `apps/api/src/modules/telegram/` | Apagar módulo |
| `apps/worker/src/legacy/` (reminder-dispatch, telegram) | Apagar após Web Push |
| `docker/n8n/` | Apagar ou arquivar externamente |
| `User.telegramChatId` | Migração Prisma (nullable → drop) |
| `ReminderChannel.TELEGRAM` | Migrar registros ou arquivar |
| `RoutineRun.channel TELEGRAM` | Manter histórico ou normalizar para WEB |
| `POST /auth/telegram/code` | Remover endpoint |
| `docker/README-LEGACY.md` (seção Telegram) | Remover ou reduzir a n8n-only |

**Fora do escopo desta MAINT:** `GoalsModule`, `FinanceGoalsModule` (consolidação em Projetos — feature separada).

---

## Migração DB (rascunho)

1. Backup completo antes de migrate.
2. Marcar lembretes `PENDING` canal TELEGRAM como `CANCELLED` ou reagendar via Web Push.
3. Migration: drop column `telegramChatId` em `User`.
4. Enum cleanup: `ReminderChannel`, `ChatChannel` — remover TELEGRAM se sem dados.

---

## Validação

- [ ] `pnpm build` OK
- [ ] Deploy v1.5 smoke sem referências Telegram nos logs (30 min)
- [ ] Lembretes Web Push end-to-end em staging

---

## Tasks (executar somente após M9)

- [ ] T001 — Spec final + revisão AD
- [ ] T002 — Implementar canal Web Push (M9)
- [ ] T003 — Migração Prisma + script de dados
- [ ] T004 — Delete módulos Telegram worker/API
- [ ] T005 — Limpar composes/env/docs
- [ ] T006 — UAT + deploy staging → produção

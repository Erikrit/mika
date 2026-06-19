# AD-017: Limpeza de legado v1.5 (2026-06-18)

**Decision:** Executar plano de remoção/isolamento de componentes legados (Telegram, n8n, composes antigos, UI órfã) alinhado ao AD-016, preservando core Web/PWA.

**Mudanças implementadas:**

* `docker-compose.v1.5.yml` como compose canônico de deploy.
* n8n extraído para `docker-compose.legacy.yml`; removido dos composes principais.
* Composes `staging.hostinger.yml` e `staging.yml` marcados DEPRECATED.
* Dev local: `docker-compose.yml` apenas Postgres + Redis; apps via `pnpm dev`.
* UI: removida vinculação Telegram em Settings; `/goals` redireciona para `/projects`.
* API: `TelegramModule` condicional (`MIKA_TELEGRAM_MODULE_ENABLED=true`); rotinas com canal `WEB` por padrão via `RoutineDeliveryPort`.
* Worker: processors legados em `apps/worker/src/legacy/`.
* Flag morta `MIKA_ROUTINES_AUTOMATION_ENABLED` removida.
* Documentação: `docker/README-LEGACY.md`, STACK, ROADMAP F12, specs F03–F05.

**Adiado até M9 (Web Push):**

* Remoção definitiva de `apps/api/src/modules/telegram/`
* Migração DB `telegramChatId`, canal `TELEGRAM`
* Apagar `docker/n8n/` e módulos Goals/FinanceGoals no backend
* Spec de execução: `.specs/features/MAINT-remocao-telegram/spec.md`

**Reason:** Reduzir superfície operacional na VPS, alinhar repositório ao roadmap v1.5 e preparar canal Web Push como substituto de lembretes externos.

**Impact:** Deploy padrão com ≤5 containers; Telegram/n8n só via compose/README legado explícito.

**Documento:** `.cursor/plans/limpeza_legado_mika_c9dfe924.plan.md`

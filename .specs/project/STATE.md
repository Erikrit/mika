# State — Mika

**Last Updated:** 2026-05-31  
**Current Work:** F01-centralizacao — Sprint 1-5 CONCLUÍDOS ✅ — Pronto para rodar em Docker

---

## Recent Decisions (Last 60 days)

### AD-001: Stack TypeScript full-stack (2026-05-31)

**Decision:** Next.js 15 + NestJS 11 + PostgreSQL 16 + pgvector  
**Reason:** Erik domina TypeScript, tipagem compartilhada entre frontend/backend, ecossistema maduro para IA e APIs  
**Trade-off:** NestJS tem mais boilerplate e footprint que Hono/Fastify  
**Impact:** Monorepo com packages compartilhados; NestJS escolhido pela estrutura modular e DI para projeto de longo prazo

### AD-002: NestJS mantido sobre Hono (2026-05-31)

**Decision:** Manter NestJS em vez de Hono para o backend  
**Reason:** Projeto complexo multi-módulo (CRUD, IA, Telegram, workers, filas); NestJS facilita organização e testes  
**Trade-off:** ~50–100MB RAM a mais vs Hono; aceitável em VPS 4GB  
**Impact:** Estrutura modular desde o início (modules: tasks, projects, memory, chat, telegram)

### AD-003: Telegram como canal MVP (2026-05-31)

**Decision:** Bot Telegram antes de WhatsApp  
**Reason:** API oficial estável, notificações confiáveis, sem risco de ban, custo zero  
**Trade-off:** Usuário precisa ter Telegram instalado  
**Impact:** F05 lembretes via Telegram na v1; WhatsApp adiado para Future Considerations

### AD-004: PWA antes de app nativo (2026-05-31)

**Decision:** Next.js PWA responsivo como interface multi-dispositivo  
**Reason:** Um codebase para web/tablet/desktop/celular; instalável; barato de hospedar  
**Trade-off:** Push notifications limitadas no iOS; mitigado por Telegram  
**Impact:** Capacitor/Tauri avaliado apenas se push nativo for crítico

### AD-005: Modelo TLC Spec-Driven (2026-05-31)

**Decision:** Adotar workflow Specify → Design → Tasks → Execute via skill tlc-spec-driven  
**Reason:** Rastreabilidade de requisitos, tasks atômicas, memória persistente entre sessões  
**Trade-off:** Overhead de documentação inicial  
**Impact:** Toda feature em `.specs/features/` com spec.md; design/tasks para features Large

---

## Active Blockers

_Nenhum blocker ativo no momento._

---

## Lessons Learned

_Nenhuma lição registrada ainda — projeto em fase inicial._

---

## Quick Tasks Completed

| # | Description | Date | Commit | Status |
|---|-------------|------|--------|--------|
| — | — | — | — | — |

---

## Deferred Ideas

- [ ] WhatsApp via Evolution API — Captured during: integrações externas
- [ ] Backend Hono como micro-serviço leve para webhooks — Captured during: AD-002
- [ ] App Flutter nativo — Captured during: multi-plataforma
- [ ] Ollama local para rotinas simples (reduzir custo OpenAI) — Captured during: AI-STRATEGY
- [ ] Import em lote de Notion — Captured during: fontes de dados

---

## Todos

- [x] Inicializar monorepo (pnpm workspaces + Turborepo) — T001 ✅
- [x] T001 Monorepo setup (pnpm + Turborepo) ✅
- [x] T002 Docker dev environment ✅
- [x] T003 Prisma schema completo ✅
- [x] T004 NestJS bootstrap ✅
- [x] T005 LifeAreas seed ✅
- [x] T006-T011 Módulos CRUD (Tasks, Projects, Goals, Events, Reflections, FinanceGoals) ✅
- [x] T012 Dashboard endpoint ✅
- [x] T013 Auth JWT básico ✅
- [x] T014-T016 Next.js bootstrap + Dashboard UI + Tasks UI ✅
- [x] T017 Telegram Bot básico ✅
- [ ] Subir Docker Compose: `cd docker && docker compose up -d`
- [ ] Rodar migration: `pnpm prisma:migrate`
- [ ] Rodar seed: `pnpm prisma:seed`
- [ ] Criar bot Telegram e configurar TELEGRAM_BOT_TOKEN no .env
- [ ] Configurar VPS e docker-compose.prod.yml

---

## Preferences

**Model Guidance Shown:** never

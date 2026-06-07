# State — Mika

**Last Updated:** 2026-06-07
**Current Work:** M8 — Assistente Completo (M7 implementado; UAT voz pendente)

---

## Recent Decisions (Last 60 days)
### AD-015: Evolução gradual para Assistente por Voz (2026-06-07)

**Decision:** Implementar primeiro Entrada por Voz no Chat utilizando Speech-to-Text do navegador antes da arquitetura completa de voz.

**Reason:**
Entregar valor rapidamente ao usuário permitindo criação de tarefas, consultas e comandos por voz reutilizando toda a infraestrutura já existente do Chat Inteligente.

A validação dos padrões de uso reais deve ocorrer antes do investimento em STT backend, TTS, Wake Word e conversação contínua.

**Impact:**

* Nenhuma alteração obrigatória no backend.
* Nenhuma alteração obrigatória nas tools.
* Alteração apenas na interface do AI Hub.
* Criação da feature `.specs/features/M7-entrada-voz-chat`.
* Base arquitetural para futura Voz Conversacional (M11).
* **Implementado (2026-06-07):** hook `useSpeechRecognition`, botão microfone no AI Hub, integração com input existente.

**Próxima Evolução Prevista:**

M7 → Speech-to-Text navegador

M11 →

* STT Backend
* Text-to-Speech
* Wake Word "Mika"
* Conversação contínua
* Modo mãos livres
### AD-014: Estudos e Insights ocultos na UI — adiado v2+ (2026-05-31)

**Decision:** Remover Estudos e Insights da sidebar; rotas `/studies` e `/insights` redirecionam para início  
**Reason:** Foco no assistente pessoal v1 (tarefas, objetivos, projetos, agenda, reflexões, contexto)  
**Impact:** Rotas mantidas por compatibilidade; módulos backend intactos

### AD-013: Finanças oculto na UI — adiado v2/v3 (2026-05-31)

**Decision:** Remover aba Finanças da sidebar e dashboard; rota `/finance` redireciona para início; tool `get_finance_goals` fora do chat v1  
**Reason:** Foco no assistente pessoal (tarefas, agenda, contexto, rotinas); planejamento financeiro completo é escopo v2/v3 (F09)  
**Impact:** API `FinanceGoalsModule` e área de vida `financial` permanecem no backend; documentação atualizada com item no radar

### AD-011: Lembretes via BullMQ delayed jobs (2026-05-31)

**Decision:** `ReminderSchedulerService` na API + processor `reminder-dispatch` no worker  
**Reason:** Consistência com padrão `memory-index`; fire-at `scheduledAt`  
**Impact:** Hooks em Tasks/Events; DND 22:00–07:00; batching por minuto

### AD-012: Chat copiloto com tool calling (2026-05-31)

**Decision:** Vercel AI SDK `tools` + `maxSteps: 5`; contexto leve + RAG sob demanda  
**Reason:** Anti-alucinação; dados reais via `get_tasks`, `search_memory`, etc.  
**Impact:** `generateReplyWithTools`, SSE web, `ChatToolExecutorService`

### AD-006: Hook useMediaQuery para breakpoint desktop (2026-05-31)

**Decision:** Extrair `useMediaQuery` / `useIsDesktop` com lazy initializer síncrono no client  
**Reason:** `useState(false)` + `useEffect` causava Sheet overlay bloqueando UI em desktop no 1º paint  
**Impact:** `layout-context`, `ai-hub` e FAB compartilham mesma lógica; Sheet não monta em >=1280px

### AD-007: RAG fallback em camadas para prioridades (2026-05-31)

**Decision:** hybridSearch → query expandida → threshold 0.55; base threshold 0.65  
**Reason:** Perguntas genéricas ("quais são minhas prioridades?") retornavam 0 chunks  
**Impact:** Chat cruza tarefas P1/P2 + memória importada antes de dizer "não encontrei"

### AD-008: lifeAreaRef id ou slug no import (2026-05-31)

**Decision:** Backend resolve UUID (filtro UI) ou slug (frontmatter markdown)  
**Reason:** UI enviava UUID mas service buscava só por slug  
**Impact:** Import com área selecionada associa lifeAreaId correto

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

### AD-009: Testes unitários fora do escopo de entrega (2026-05-31)

**Decision:** Não criar nem exigir testes unitários como gate em tasks/milestones  
**Reason:** Erik prefere validação por build + UAT manual; evita bloqueio e ruído em entregas  
**Impact:** Ondas F sem task jest; gates = build, migrate, checklist manual. Ver [CONVENTIONS.md](./CONVENTIONS.md)

### AD-010: Conteúdo e documentação em pt-BR (2026-05-31)

**Decision:** UI, labels, mensagens de API ao usuário, specs e docs de produto em português brasileiro  
**Reason:** Produto e operador são lusófonos; reduz inconsistência (ex.: labels "RAG on" vs "RAG ligado")  
**Impact:** Revisar strings em novas telas/APIs; identificadores técnicos de código podem permanecer em inglês

---

## Active Blockers

_Nenhum blocker ativo._

Próximo foco:

- UAT manual M7 — Chrome Desktop + Chrome Android
- M8 — Assistente Completo
---

## Lessons Learned

### LL-001: Breakpoint SSR/hidratação com Sheet overlay (2026-05-31)

**Context:** Tela congelada em desktop >=1280px após login  
**Lesson:** Estado inicial de media query deve usar lazy initializer síncrono; não montar Sheet quando viewport é desktop  
**Applied in:** `use-media-query.ts`, `ai-hub.tsx`

### LL-002: Validar UX antes de infraestrutura complexa (2026-06-07)

**Context:** Evolução para assistente por voz completa.

**Lesson:**
Antes de implementar STT backend, TTS e wake word, validar se o usuário realmente utiliza comandos por voz e quais são os cenários mais frequentes.

**Applied in:**
M7 — Entrada por Voz no Chat
---

## Quick Tasks Completed

| # | Description | Date | Commit | Status |
|---|-------------|------|--------|--------|
| — | — | — | — | — |

---

## Deferred Ideas

- [ ] **Finanças (UI + chat)** — Metas financeiras na web, dashboard e tool `get_finance_goals`; API pronta — alvo v2/v3 (AD-013)
- [ ] WhatsApp via Evolution API — Captured during: integrações externas
- [ ] Backend Hono como micro-serviço leve para webhooks — Captured during: AD-002
- [ ] App Flutter nativo — Captured during: multi-plataforma
- [ ] Ollama local para rotinas simples (reduzir custo OpenAI) — Captured during: AI-STRATEGY
- [ ] Import em lote de Notion — Captured during: fontes de dados
- [ ] Voz Conversacional Completa (STT Backend, TTS, Wake Word e Hands-Free) — Dependente da validação do M7
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
- [x] Vinculação Telegram (/vincular + settings web) ✅
- [x] OpenAI integração básica (packages/ai + ChatModule) ✅
- [x] AI Hub web chat habilitado ✅
- [x] Swagger/OpenAPI em /docs ✅
- [x] README runbook operacional atualizado ✅
- [x] M2 F02 memória longo prazo (pgvector, worker, RAG, UI /memories) ✅
- [x] MAINT-M1 estabilização (T001–T009): AI Hub desktop, RAG prioridades, import área, edit/delete tarefas ✅
- [ ] T018 E2E smoke test (fora do escopo M1)
- [x] Docker staging: `docker-compose.staging.yml`, worker, Caddy, `README-DEPLOY.md` (2026-06-02)
- [x] Subir VPS Hostinger e validar smoke staging
- [x] M7 Spec criada (`spec.md`, `design.md`, `tasks.md`) ✅
- [x] Implementar hook `useSpeechRecognition` ✅
- [x] Adicionar botão de microfone ao AI Hub ✅
- [x] Integrar transcrição ao campo de mensagem ✅
- [x] Validar Desktop Chrome (UAT Erik)
- [x] Validar Android Chrome (UAT Erik)
- [ ] Registrar UAT da feature M7
---

## Preferences

**Model Guidance Shown:** never  
**Unit tests:** ignorar — não criar nem usar como gate (AD-009)  
**Idioma dev/docs/UI:** pt-BR para textos visíveis e documentação (AD-010)  
**Convenções:** [.specs/project/CONVENTIONS.md](./CONVENTIONS.md)

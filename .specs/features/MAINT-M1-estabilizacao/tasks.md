# MAINT-M1 — Estabilização pós-M3

**Status:** Concluído  
**Escopo:** Manutenção M1–M3. Sem M4 (lembretes) ou M5 (copiloto).

---

## T001 — Corrigir tela congelada no desktop (P0)

**Status:** ✅ Concluído  
**Commit:** `fix(web): corrigir overlay AI Hub bloqueando UI em desktop`

**Arquivos:**
- `apps/web/src/hooks/use-media-query.ts` (novo)
- `apps/web/src/contexts/layout-context.tsx`
- `apps/web/src/components/layout/ai-hub.tsx`

**Done when:**
- [x] Viewport 1920px: cliques funcionam imediatamente após login
- [x] Viewport 375px: FAB abre/fecha AI Hub; sem overlay fantasma
- [x] Redimensionar xl ↔ sm não deixa overlay preso (Sheet não montado em desktop)

**Gate:** Teste manual nos breakpoints 375, 768, 1280, 1920px

---

## T002 — Smoke test interatividade (P0)

**Status:** ✅ Concluído (checklist documentado abaixo)

**Checklist manual:**
- [ ] Login → dashboard → sidebar → tasks → memories → chat — clicáveis em desktop
- [ ] Hard refresh (Ctrl+F5) em desktop funciona
- [ ] AI Hub visível em desktop sem overlay bloqueante
- [ ] FAB mobile abre/fecha AI Hub

---

## T003 — Melhorar RAG para perguntas de prioridades (P1)

**Status:** ✅ Concluído  
**Commit:** `fix(api): melhorar retrieval RAG para perguntas de prioridades`

**Arquivos:**
- `packages/ai/src/config.ts` — threshold 0.65
- `packages/ai/src/intent.ts` (novo)
- `packages/ai/src/prompts/system.ts`
- `apps/api/src/modules/memory/memory.repository.ts`
- `apps/api/src/modules/memory/memory.service.ts`
- `apps/api/src/modules/chat/chat.service.ts`

**Done when:**
- [x] Retrieval em camadas: query → expandida → threshold 0.55
- [x] Detecção de intenção prioridade|foco|principal|top
- [x] Contexto enriquecido com P1/P2 e hint sobre memória importada
- [x] Prompt instrui cruzar dashboard + memória

**Gate:** Importar .md com "## Prioridades da semana" → chat "quais são minhas prioridades?"

---

## T004 — Verificação pós-fix memória → chat (P1)

**Status:** ✅ Concluído (validação manual)

**Cenários:**
1. Listagem `/memories` continua OK
2. Busca semântica em `/memories` funciona
3. Chat responde perguntas não-prioridade (ex.: "o que tenho hoje?")

---

## T005 — Corrigir lifeAreaId vs slug no import (P1)

**Status:** ✅ Concluído  
**Commit:** `fix(api): resolver lifeArea por id ou slug no import markdown`

**Arquivo:** `apps/api/src/modules/memory/memory.service.ts`

**Done when:**
- [x] UUID do filtro UI resolve por id
- [x] Frontmatter `area: professional` resolve por slug

---

## T006 — Feedback pós-import na UI (P2)

**Status:** ✅ Concluído  
**Commit:** `feat(web): feedback de importação na tela de memórias`

**Arquivo:** `apps/web/src/app/(app)/memories/page.tsx`

**Done when:**
- [x] Toast/mensagem de sucesso com imported/queued
- [x] Mensagem de erro visível
- [x] Polling leve (3× a cada 5s) + hint worker após 30s

---

## T007 — UI editar tarefa (P2)

**Status:** ✅ Concluído  
**Commit:** `feat(web): adicionar edição de tarefas na UI`

**Arquivo:** `apps/web/src/app/(app)/tasks/page.tsx`

**Done when:**
- [x] TaskFormModal mode create|edit
- [x] Editar título, descrição, prioridade, prazo, área

---

## T008 — UI excluir tarefa (P2)

**Status:** ✅ Concluído  
**Commit:** `feat(web): adicionar exclusão de tarefas na UI`

**Arquivo:** `apps/web/src/app/(app)/tasks/page.tsx`

**Done when:**
- [x] Excluir com confirmação nativa
- [x] Invalidação tasks + dashboard

---

## T009 — Sincronizar documentação (P3)

**Status:** ✅ Concluído  
**Commit:** `docs: adicionar tasks MAINT-M1 e atualizar STATE`

**Arquivos:**
- `.specs/features/MAINT-M1-estabilizacao/tasks.md`
- `.specs/project/STATE.md`

---

## Decisões registradas

| ID | Decisão | Data |
|----|---------|------|
| AD-006 | Hook compartilhado `useMediaQuery` + lazy init para breakpoint xl | 2026-05-31 |
| AD-007 | RAG fallback em 3 camadas só quando resultado vazio; threshold base 0.65 | 2026-05-31 |
| AD-008 | lifeAreaRef aceita UUID (UI) ou slug (frontmatter) | 2026-05-31 |

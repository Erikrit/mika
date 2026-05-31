# M4 — Contexto Pessoal e Memória Humanizada

**Status:** Done (UAT Erik 2026-05-31)  
**Milestone:** M4 (ROADMAP)  
**Referências:** [PERSONAL_CONTEXT_ENGINE.md](../../project/PERSONAL_CONTEXT_ENGINE.md), [MEMORY_GOVERNANCE.md](../../project/MEMORY_GOVERNANCE.md), [F02 spec](../F02-memoria-longo-prazo/spec.md), [CONVENTIONS.md](../../project/CONVENTIONS.md)

## Problem Statement

Mika indexa tarefas e notas importadas, mas não trata documentos pessoais como entidades governadas (versionamento, camadas, privacidade). O chat recupera memória sem filtros de intenção nem auditoria de uso sensível. Erik precisa de um hub `/context` para importar, classificar e controlar o que entra no RAG.

## Goals

- Documentos pessoais como `ContextDocument` com versionamento
- Memória em 3 camadas: FIXED / EVOLUTIVE / SENSITIVE
- Retrieval por intenção com threshold elevado para sensível
- Governança: confidence, health dashboard, audit log
- UI Companion OS em `/context`; `/memories` → redirect

## Out of Scope (M5/M6/M9)

| Item | Reason |
|------|--------|
| Lembretes proativos (F10) | M5 |
| Copiloto / tool calling (F06-chat-inteligente) | M6 |
| Knowledge Graph, Life Timeline | Docs only |
| PDF/DOCX nativo | Stub; M4 = Markdown/TXT |
| Deploy VPS | Track paralelo |

---

## Requirements

| ID | Feature | Requisito |
|----|---------|-----------|
| M4-R01 | F05 | CRUD `ContextDocument`; import `.md`/`.txt` com metadados (título, categoria PCE, camada sugerida) |
| M4-R02 | F05 | Chunks vinculados a documento; metadados origem/data/categoria |
| M4-R03 | F06 | Classificação automática + override manual: FIXED / EVOLUTIVE / SENSITIVE |
| M4-R04 | F06 | CRUD sources → camada EVOLUTIVE automaticamente |
| M4-R05 | F07 | Retrieval por intenção: filtrar categorias/camadas antes da busca |
| M4-R06 | F07 | Threshold mais alto para SENSITIVE; nunca retornar SENSITIVE com `enabledForRag=false` |
| M4-R07 | F07 | Registrar `MemoryUsageAudit` quando chunk sensível entra no prompt |
| M4-R08 | F09 | `privacyLevel` PUBLIC / PRIVATE / SENSITIVE por documento e chunk |
| M4-R09 | F09 | Toggle `enabledForRag`, arquivar, excluir documento + cascata chunks |
| M4-R10 | F09 | Versionamento: nova versão ao reimportar/editar conteúdo |
| M4-R11 | GOV | `confidenceType` FACT / INFERRED / HYPOTHESIS + score 0–1 |
| M4-R12 | GOV | Memory Health: totais, duplicatas (hash), órfãos, conflitos heurísticos |
| M4-R13 | F08 | System prompt com perfil fixo (top chunks FIXED) + guardrails PCE |
| M4-R14 | F08 | Rotinas podem incluir snippet de memória fixa (flag env) |
| M4-R15 | UI | `/context` hub Perfil + Avançado (templates, editor, governança) |
| M4-R16 | UI | `/memories` redirect 308 → `/context` |

---

## User Stories (P1)

### Importar Objetivos de Vida

**As Erik**, I want to import `Objetivos de Vida.md` as FIXED memory so Mika knows my long-term goals.

**Acceptance:** Import → document FIXED, chunks indexed; chat "quais meus objetivos?" uses context without hallucination.

### Proteger memória sensível

**As Erik**, I want to mark financial docs SENSITIVE and disable RAG so they never appear in chat unless explicitly allowed.

**Acceptance:** `enabledForRag=false` → chunk never in prompt; audit when used.

### Versionamento

**As Erik**, I want reimport to create v2 while v1 remains consultable.

**Acceptance:** GET `/context/documents/:id/versions` returns history; GET `.../versions/:versionId` returns content read-only.

### Perfil emocional para a Mika

**As Erik**, I want a guided template "Perfil para a Mika" so the assistant adapts tone and avoids what hurts me emotionally.

**Acceptance:** Template → editor → save as FIXED; chat and routines (flag on) reflect preferred tone from document.

---

## Critério de Done (ROADMAP M4)

- [x] Import de documentos pessoais em área dedicada (`/context`)
- [x] Classificação fixa / evolutiva / sensível
- [x] Chat recupera contexto relevante sem carregar tudo no prompt
- [x] Respostas consideram objetivos de vida e histórico (RAG + perfil FIXED)
- [x] Memórias sensíveis com controle explícito de uso, edição e exclusão
- [x] UAT manual Erik (T074)

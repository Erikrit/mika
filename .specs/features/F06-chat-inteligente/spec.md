# F06 — Chat Inteligente

## Problem Statement

Erik precisa conversar naturalmente com Mika para obter respostas contextualizadas — "O que preciso fazer esta semana?", "Estou atrasado em alguma meta?", "Como está minha situação financeira?" — sem navegar menus ou filtros manualmente.

## Goals

- [x] Chat conversacional via web e Telegram
- [x] Respostas contextualizadas com dados reais (tasks, events, goals, memory)
- [x] Tool calling para consultas e ações (criar tarefa, buscar memória)
- [x] Streaming de respostas na web

## Out of Scope

| Feature | Reason |
|---------|--------|
| Voz / áudio | Future |
| Consultas financeiras no chat (`get_finance_goals`) | v2/v3 (AD-013) |
| Multi-idioma | v2 |
| Chat entre usuários | N/A (single user) |
| Decisões autônomas (Mika age sozinha) | Future (F08) |

---

## User Stories

### P1: Perguntas sobre Prioridades ⭐ MVP

**User Story**: As Erik, I want to ask "What do I need to do this week?" and get a prioritized list so that I don't need to check multiple screens.

**Why P1**: Pergunta mais frequente — valor imediato.

**Acceptance Criteria**:

1. WHEN user asks "O que preciso fazer esta semana?" THEN system SHALL call get_tasks + get_events for next 7 days
2. WHEN data retrieved THEN response SHALL list items ordered by priority ASC, dueAt ASC
3. WHEN response generated THEN system SHALL use GPT-4o-mini with real data (no hallucination)

**Independent Test**: Perguntar → resposta lista tarefas reais do DB.

---

### P1: Contexto de Memória ⭐ MVP

**User Story**: As Erik, I want to ask about specific projects and get contextual answers so that Mika acts as external memory.

**Why P1**: Diferencial vs ToDo apps — requer F02.

**Acceptance Criteria**:

1. WHEN user asks about known project (e.g., "João Pessoa") THEN system SHALL call search_memory tool
2. WHEN memory found THEN response SHALL reference specific tasks, goals, events related
3. WHEN no memory found THEN system SHALL respond: "Não encontrei informações sobre [topic]"

**Independent Test**: Perguntar sobre projeto existente → resposta contextual. Inexistente → resposta honesta.

---

### P1: Chat via Telegram ⭐ MVP

**User Story**: As Erik, I want to chat with Mika on Telegram so that I can interact on mobile without opening the web app.

**Acceptance Criteria**:

1. WHEN user sends free text on Telegram THEN system SHALL route to ChatModule
2. WHEN response ready THEN bot SHALL reply within 10s (P95)
3. WHEN response >4096 chars THEN system SHALL split into multiple messages

**Independent Test**: Enviar pergunta no Telegram → resposta coerente em <10s.

---

### P2: Situação Financeira

**User Story**: As Erik, I want to ask about my financial goals and get a summary so that I track progress without opening spreadsheets.

**Status:** Adiado v2/v3 (AD-013) — tool removida do chat v1; API `FinanceGoalsModule` permanece.

**Acceptance Criteria**:

1. WHEN user asks "Como está minha situação financeira?" THEN system SHALL call get_finance_goals
2. WHEN goals exist THEN response SHALL show each goal with progress percentage

**Independent Test**: Perguntar → resposta com metas e percentuais reais.

---

### P2: Criar Tarefa via Chat

**User Story**: As Erik, I want to say "Lembre de pagar conta amanhã" and have Mika create a task so that capture is frictionless.

**Acceptance Criteria**:

1. WHEN user message implies task creation THEN system SHALL call create_task tool with parsed title and dueAt
2. WHEN task created THEN response SHALL confirm: "✅ Tarefa criada: [title] para [date]"

**Independent Test**: "Lembre de ligar pro médico sexta" → tarefa criada com dueAt sexta.

---

### P2: Chat Web com Streaming

**User Story**: As Erik, I want to see responses appear in real-time on the web so that the experience feels conversational.

**Acceptance Criteria**:

1. WHEN user sends message on web THEN system SHALL stream response via WebSocket/SSE
2. WHEN streaming THEN UI SHALL show typing indicator until complete

**Independent Test**: Enviar mensagem web → texto aparece progressivamente.

---

## Edge Cases

- WHEN OpenAI timeout THEN system SHALL respond: "Estou com dificuldade agora, tente em alguns minutos"
- WHEN user sends empty message THEN system SHALL ignore
- WHEN conversation >20 messages THEN system SHALL summarize older messages to fit context window
- WHEN user asks to delete data THEN system SHALL NOT comply via chat (direct to settings)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| CHAT-01 | P1: Prioridades | - | Done |
| CHAT-02 | P1: Memória | - | Done |
| CHAT-03 | P1: Telegram | - | Done |
| CHAT-04 | P2: Finanças | - | Deferred (v2/v3) |
| CHAT-05 | P2: Criar Tarefa | - | Done |
| CHAT-06 | P2: Streaming Web | - | Done |

---

## Success Criteria

- [ ] Resposta P95 < 5s (Telegram) / < 3s first token (web streaming)
- [x] Zero hallucination de datas/compromissos (dados reais only)
- [ ] ≥80% das perguntas respondidas satisfatoriamente (auto-avaliação semanal)

# F01 — Centralização de Informações

## Problem Statement

Erik gerencia simultaneamente trabalhos, família, finanças, saúde, viagens e projetos pessoais. Informações estão espalhadas entre Notion, planilhas, cabeça e apps diversos. Sem centralização, a IA não tem dados para priorizar, lembrar ou apoiar decisões.

## Goals

- [ ] Usuário registra objetivos, tarefas, projetos, eventos, reflexões e metas financeiras em um único sistema
- [ ] Cada item categorizado por área de vida (LifeArea)
- [ ] API REST completa consumível por web e Telegram
- [ ] UI web mínima funcional para CRUD visual

## Out of Scope

| Feature | Reason |
|---------|--------|
| Import Notion/PDF | Fase 2 (M2) |
| Sync Google Calendar | Fase 2 (M2) |
| Busca semântica / RAG | F02 — Memória |
| Priorização automática por IA | F06 — Chat |
| Multi-usuário | Future |
| UI / chat de metas financeiras | v2/v3 — API backend mantida (AD-013) |

---

## User Stories

### P1: Registrar Tarefa ⭐ MVP

**User Story**: As Erik, I want to create tasks with title, priority, due date and life area so that I can track what needs to be done across all areas of my life.

**Why P1**: Tarefas são a unidade básica de execução — sem elas, nada funciona.

**Acceptance Criteria**:

1. WHEN user sends POST /tasks with title THEN system SHALL create task with status `todo` and return 201
2. WHEN user sets priority (1-5) THEN system SHALL persist and allow filtering by priority
3. WHEN user sets dueAt THEN system SHALL include task in daily queries for that date
4. WHEN user assigns lifeAreaId THEN system SHALL associate task with that LifeArea
5. WHEN user sends GET /tasks?status=todo THEN system SHALL return only pending tasks ordered by priority ASC, dueAt ASC

**Independent Test**: Criar tarefa via API, listar, marcar como done, verificar status change.

---

### P1: Registrar Projeto ⭐ MVP

**User Story**: As Erik, I want to group tasks under projects with status and target dates so that I can track progress on larger initiatives like "Mudança João Pessoa".

**Why P1**: Projetos dão contexto — "João Pessoa" é referência para memória e chat futuro.

**Acceptance Criteria**:

1. WHEN user creates project with title and lifeArea THEN system SHALL persist with status `active`
2. WHEN user creates task with projectId THEN system SHALL link task to project
3. WHEN user sends GET /projects/:id THEN system SHALL return project with task count and completion percentage
4. WHEN user sets project status to `completed` THEN system SHALL NOT auto-complete open tasks (user decides)

**Independent Test**: Criar projeto "João Pessoa", adicionar 3 tarefas, completar 1, verificar 33% progress.

---

### P1: Registrar Objetivo ⭐ MVP

**User Story**: As Erik, I want to define goals with short/medium/long horizon so that Mika can track my life objectives over time.

**Why P1**: Objetivos alimentam revisões semanais e chat contextual.

**Acceptance Criteria**:

1. WHEN user creates goal with horizon `short|medium|long` THEN system SHALL persist and allow filtering by horizon
2. WHEN user updates progress (0-100) THEN system SHALL persist and reflect in GET responses
3. WHEN goal has targetDate in past and progress < 100 THEN system SHALL flag as overdue in queries

**Independent Test**: Criar meta longo prazo "Certificação AWS", set progress 40%, verificar flag overdue se targetDate passou.

---

### P1: Registrar Evento ⭐ MVP

**User Story**: As Erik, I want to register events with date/time so that daily summaries include my commitments.

**Why P1**: Compromissos são essenciais para resumo diário (F03).

**Acceptance Criteria**:

1. WHEN user creates event with startsAt THEN system SHALL persist and return in GET /events?from=X&to=Y range queries
2. WHEN event is isAllDay=true THEN system SHALL ignore time component in daily summary
3. WHEN user queries events for today THEN system SHALL return events where startsAt falls within today (user timezone)

**Independent Test**: Criar evento amanhã 14:00, query today's events — não deve aparecer.

---

### P2: Registrar Reflexão

**User Story**: As Erik, I want to write daily reflections so that Mika builds context about my energy and progress over time.

**Why P2**: Importante para rotina noturna, mas MVP funciona sem.

**Acceptance Criteria**:

1. WHEN user creates reflection with content THEN system SHALL encrypt content at-rest (AES-256)
2. WHEN user sets energyLevel THEN system SHALL persist alongside reflection
3. WHEN user sets routineType `evening` THEN system SHALL tag for nightly routine queries

**Independent Test**: Criar reflexão, verificar que content no DB está criptografado.

---

### P2: Registrar Meta Financeira Básica

**User Story**: As Erik, I want to track financial goals with target and current amounts so that I can ask Mika about my financial situation.

**Why P2**: Metas financeiras básicas (não controle completo F09).

**Status (2026-05-31):** API implementada (`FinanceGoalsModule`); **UI web e chat adiados v2/v3** (AD-013). LifeArea `financial` e documentos de contexto financeiro continuam disponíveis.

**Acceptance Criteria**:

1. WHEN user creates financeGoal with targetAmount and currentAmount THEN system SHALL calculate progress percentage
2. WHEN user queries financeGoals THEN system SHALL return all active goals with progress
3. Content SHALL be encrypted at-rest

**Independent Test**: Meta "Reserva mudança" R$50k, current R$20k → progress 40%.

---

### P2: UI Web Mínima

**User Story**: As Erik, I want a responsive web interface to manage my data on desktop and tablet so that I don't rely only on Telegram.

**Why P2**: Telegram cobre mobile; web cobre desktop/tablet.

**Acceptance Criteria**:

1. WHEN user opens web app THEN system SHALL show dashboard with today's tasks and events
2. WHEN user clicks "Nova Tarefa" THEN system SHALL show form and create via API
3. WHEN viewport < 768px THEN layout SHALL be mobile-friendly (responsive)
4. WHEN user installs PWA THEN app SHALL be addable to home screen

**Independent Test**: Abrir web, criar tarefa via form, ver na listagem.

---

## Edge Cases

- WHEN task title is empty THEN system SHALL return 400 validation error
- WHEN lifeAreaId doesn't exist THEN system SHALL return 404
- WHEN dueAt is in the past and task created THEN system SHALL allow (backlog) but flag as overdue
- WHEN user has 0 tasks THEN dashboard SHALL show empty state with prompt to create
- WHEN duplicate project title THEN system SHALL allow (no unique constraint on title)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| CENT-01 | P1: Registrar Tarefa | Tasks | Pending |
| CENT-02 | P1: Registrar Tarefa (filter) | Tasks | Pending |
| CENT-03 | P1: Registrar Projeto | Tasks | Pending |
| CENT-04 | P1: Registrar Projeto (progress) | Tasks | Pending |
| CENT-05 | P1: Registrar Objetivo | Tasks | Pending |
| CENT-06 | P1: Registrar Evento | Tasks | Pending |
| CENT-07 | P2: Registrar Reflexão | Tasks | Pending |
| CENT-08 | P2: Meta Financeira | Tasks | Pending |
| CENT-09 | P2: UI Web Mínima | Tasks | Pending |
| CENT-10 | LifeAreas seed | Tasks | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped ⚠️ (tasks.md will map)

---

## Success Criteria

- [ ] CRUD completo para 6 entidades via API REST
- [ ] 5 LifeAreas seedadas automaticamente no setup
- [ ] UI web funcional em desktop e mobile (responsive)
- [ ] Tempo de resposta API < 200ms P95 para CRUD
- [ ] Zero dados sensíveis em logs

# F03 — Resumo Diário

> **Nota v1.5 (AD-017):** n8n é opcional/legado. Disparo manual via `POST /routines/*` ou cron interno futuro. Canal padrão: WEB (Dashboard via `GET /routines/latest`).

## Problem Statement

Erik inicia cada dia sem clareza sobre prioridades, compromissos e pendências. Precisa de um resumo automático entregue pela manhã que reduza a carga cognitiva de "o que importa hoje?".

## Goals

- [ ] Resumo diário gerado automaticamente às 07:00 (timezone do usuário)
- [ ] Inclui: top 3 prioridades, compromissos, pendências atrasadas, alertas
- [ ] Entregue via Telegram e disponível na web
- [ ] Pergunta interativa: "Qual sua prioridade principal hoje?"

## Out of Scope

| Feature | Reason |
|---------|--------|
| Personalização de horário | v2 (preferences) |
| Resumo por email | Future |
| Resumo em áudio | Future |

---

## User Stories

### P1: Resumo Automático Matinal ⭐ MVP

**User Story**: As Erik, I want a daily summary every morning at 7am so that I start the day knowing my priorities without mental effort.

**Why P1**: Rotina central do copiloto — valor imediato diário.

**Acceptance Criteria**:

1. WHEN cron triggers at 07:00 (user timezone) THEN n8n SHALL call POST /routines/daily-summary
2. WHEN routine runs THEN system SHALL fetch today's tasks (by priority), events, and overdue items
3. WHEN data fetched THEN AI SHALL generate summary max 300 words in Portuguese
4. WHEN summary generated THEN system SHALL send via Telegram and save as RoutineRun
5. WHEN summary includes overdue items THEN system SHALL highlight them with ⚠️

**Independent Test**: Trigger manual POST /routines/daily-summary → receber resumo no Telegram com dados corretos.

---

### P1: Pergunta de Prioridade ⭐ MVP

**User Story**: As Erik, I want Mika to ask my main priority after the summary so that I consciously choose my focus.

**Acceptance Criteria**:

1. WHEN summary delivered THEN message SHALL end with "Qual sua prioridade principal hoje?"
2. WHEN user responds THEN system SHALL save response as Reflection with routineType `morning`
3. WHEN user doesn't respond by 10:00 THEN system SHALL NOT send reminder (no nagging)

**Independent Test**: Responder prioridade → verificar Reflection salva.

---

### P2: Resumo na Web

**User Story**: As Erik, I want to see today's summary on the web dashboard so that I don't need Telegram on desktop.

**Acceptance Criteria**:

1. WHEN user opens dashboard THEN system SHALL show latest RoutineRun of type daily_summary for today
2. WHEN no summary yet today THEN dashboard SHALL show "Resumo será gerado às 07:00"

**Independent Test**: Abrir dashboard após resumo → conteúdo visível.

---

## Edge Cases

- WHEN no tasks/events today THEN summary SHALL say "Dia livre! Aproveite ou adiante algo"
- WHEN OpenAI unavailable THEN system SHALL send basic list (no AI prose) via template fallback
- WHEN user timezone changes THEN cron SHALL adjust (stored in User.preferences)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| DAILY-01 | P1: Resumo Automático | M3 | Done |
| DAILY-02 | P1: Pergunta Prioridade | M3 | Done |
| DAILY-03 | P2: Resumo Web | M3 | Done |

---

## Success Criteria

- [ ] Resumo entregue ≥95% dos dias (30 day rolling)
- [ ] Resumo gerado em < 30s
- [ ] Usuário reporta clareza ≥4/5 em pesquisa semanal

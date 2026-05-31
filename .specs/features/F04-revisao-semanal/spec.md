# F04 — Revisão Semanal

## Problem Statement

Sem revisão periódica, Erik perde visão do que foi conquistado, o que atrasou e o que perdeu relevância. A revisão semanal automatizada mantém alinhamento entre curto, médio e longo prazo.

## Goals

- [ ] Revisão semanal automática domingo 20:00
- [ ] Cobre: concluídos, atrasados, perda de prioridade, novos riscos
- [ ] Sugestão de foco para próxima semana
- [ ] Entregue via Telegram e web

## Out of Scope

| Feature | Reason |
|---------|--------|
| Revisão mensal/trimestral | Future (Fase 5) |
| Comparação com semanas anteriores | v2 |
| Export PDF | Future |

---

## User Stories

### P1: Revisão Automática Semanal ⭐ MVP

**User Story**: As Erik, I want a weekly review every Sunday evening so that I reflect on progress and plan the next week.

**Why P1**: Complementa resumo diário com visão macro.

**Acceptance Criteria**:

1. WHEN cron triggers Sunday 20:00 THEN system SHALL call POST /routines/weekly-review
2. WHEN routine runs THEN system SHALL aggregate: tasks completed this week, overdue tasks, goals with no interaction >7 days, events next week
3. WHEN data aggregated THEN AI SHALL generate review max 500 words: concluídos (celebrar), atrasados (listar), perda prioridade, riscos, sugestão foco
4. WHEN review generated THEN system SHALL send via Telegram and save as RoutineRun type weekly_review

**Independent Test**: Trigger manual → receber revisão com dados da semana.

---

### P2: Detecção de Perda de Prioridade

**User Story**: As Erik, I want Mika to flag goals and tasks I've neglected so that nothing important silently fades away.

**Acceptance Criteria**:

1. WHEN task/goal has no update for >7 days AND status is active/todo THEN system SHALL flag as neglected
2. WHEN weekly review runs THEN neglected items SHALL appear in "Perderam prioridade" section
3. WHEN item flagged neglected THEN system SHALL set neglectedSince date

**Independent Test**: Criar tarefa, não interagir 8 dias → aparece na revisão.

---

## Edge Cases

- WHEN week had zero activity THEN review SHALL encourage re-engagement, not shame
- WHEN all tasks completed THEN review SHALL celebrate and suggest stretch goals

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| WEEK-01 | P1: Revisão Automática | M3 | Done |
| WEEK-02 | P2: Perda Prioridade | M3 | Done |

---

## Success Criteria

- [ ] Revisão entregue 4/4 domingos do mês
- [ ] ≥1 item "perdeu prioridade" identificado quando aplicável
- [ ] Usuário ajusta plano da semana seguinte após ≥75% das revisões

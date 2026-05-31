# F05 — Sistema de Lembretes

## Problem Statement

Mesmo com resumos diários, Erik esquece tarefas pontuais, compromissos próximos e objetivos que ficam parados. Lembretes proativos fecham a lacuna entre "saber o que fazer" e "ser lembrado na hora certa".

## Goals

- [ ] Notificar tarefas com dueAt próximo (1h, 1 dia antes)
- [ ] Notificar eventos 30 min antes
- [ ] Alertar objetivos negligenciados (>7 dias sem interação)
- [ ] Canais: Telegram (MVP) + web push (PWA, M4)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Lembretes recorrentes complexos | v2 |
| Snooze inteligente | F08 Coaching |
| Lembretes por localização | Future |
| SMS | Future |

---

## User Stories

### P1: Lembrete de Tarefa ⭐ MVP

**User Story**: As Erik, I want to be reminded before task deadlines so that I don't miss important due dates.

**Why P1**: Esquecimento de deadlines é pain point #1.

**Acceptance Criteria**:

1. WHEN task has dueAt within 24h THEN worker SHALL schedule Reminder for dueAt - 1h
2. WHEN task has dueAt within 1h THEN worker SHALL schedule Reminder for dueAt - 15min
3. WHEN reminder triggers THEN system SHALL send Telegram message with task title and dueAt
4. WHEN task marked done before reminder THEN system SHALL cancel pending reminder

**Independent Test**: Criar tarefa due em 1h → receber lembrete 15min antes.

---

### P1: Lembrete de Evento ⭐ MVP

**User Story**: As Erik, I want event reminders 30 minutes before so that I have time to prepare.

**Acceptance Criteria**:

1. WHEN event created with startsAt THEN system SHALL schedule Reminder for startsAt - 30min
2. WHEN reminder triggers THEN Telegram message SHALL include title, time, location (if set)

**Independent Test**: Criar evento em 45min → lembrete em 15min.

---

### P2: Alerta de Objetivo Negligenciado

**User Story**: As Erik, I want alerts when I've ignored a goal for too long so that important objectives don't fade.

**Acceptance Criteria**:

1. WHEN goal/task active with no update >7 days THEN daily worker SHALL create Reminder
2. WHEN alert sent THEN message SHALL suggest: "Quer retomar [goal] ou arquivar?"
3. Maximum 1 neglected alert per item per week (no spam)

**Independent Test**: Goal parado 8 dias → receber 1 alerta.

---

### P2: Web Push (PWA)

**User Story**: As Erik, I want browser notifications on desktop so that I see reminders without Telegram.

**Acceptance Criteria**:

1. WHEN user grants notification permission THEN system SHALL register push subscription
2. WHEN reminder triggers with channel `both` THEN system SHALL send Telegram + web push

**Independent Test**: Grant permission → receber push no browser.

---

## Edge Cases

- WHEN multiple reminders same minute THEN system SHALL batch into single message
- WHEN Telegram delivery fails THEN system SHALL retry 2x, log in NotificationLog
- WHEN user in DND hours (22:00-07:00) THEN non-urgent reminders SHALL queue for 07:00

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| REM-01 | P1: Lembrete Tarefa | - | Pending |
| REM-02 | P1: Lembrete Evento | - | Pending |
| REM-03 | P2: Objetivo Negligenciado | - | Pending |
| REM-04 | P2: Web Push | - | Pending |

---

## Success Criteria

- [ ] ≥90% dos lembretes entregues com sucesso
- [ ] Zero lembretes duplicados para mesmo item
- [ ] Redução de tarefas vencidas não concluídas em ≥50% vs baseline

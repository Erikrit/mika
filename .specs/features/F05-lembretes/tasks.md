# F05 — Lembretes — Tasks (T087–T096)

**Spec**: `.specs/features/F05-lembretes/spec.md`  
**Design**: `.specs/features/F05-lembretes/design.md`  
**Status:** Done (local)  
**Total tasks:** 10

| ID | Task | Status | Gate |
|----|------|--------|------|
| T087 | ReminderSchedulerService + regras de timing | Done | build |
| T088 | Hooks TasksModule (schedule/cancel) | Done | row Reminder após create |
| T089 | Hooks EventsModule | Done | evento → lembrete −30min |
| T090 | Processor reminder-dispatch no worker | Done | job dispara Telegram |
| T091 | NotificationLog + retry 2x | Done | log em falha |
| T092 | DND 22:00–07:00 | Done | reagenda 07:00 |
| T093 | Batching mesmo minuto | Done | N lembretes → 1 msg |
| T094 | Cron neglected → Reminder | Done | goal 8d → alerta |
| T095 | README + ROADMAP sync M5 | Done | docs |
| T096 | UAT checklist Erik | Done | manual |

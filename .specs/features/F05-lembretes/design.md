# F05 — Sistema de Lembretes — Design

**Status:** Approved  
**Last Updated:** 2026-05-31

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Agendamento | BullMQ delayed jobs (`reminder-dispatch`) | Reutiliza Redis existente; fire-at `scheduledAt` |
| Producer | `ReminderQueueService` na API (padrão `MemoryQueueService`) | Consistência com F02 |
| Idempotência | Cancel PENDING + recreate on entity update | Evita duplicatas sem migration extra |
| Canal MVP | Telegram via `TelegramService.sendToUser` | AD-003; web push em P2 |
| DND | Reagendar para 07:00 se `scheduledAt` cair 22:00–07:00 | Spec edge case |
| Batching | Worker agrupa lembretes do mesmo userId/minuto | Spec edge case |
| Neglected | Cron diário no worker + `neglectedSince` existente | Max 1 alerta/semana/entidade |

## Componentes

- `apps/api/modules/reminders/`: `ReminderSchedulerService`, `ReminderQueueService`, `RemindersModule`
- Hooks em `TasksService` e `EventsService`
- `apps/worker/processors/reminder-dispatch.processor.ts`
- Reutiliza `TelegramService.sendToUser` e modelos `Reminder` / `NotificationLog`

## Regras de timing

| Entidade | Condição | Lembrete em |
|----------|----------|-------------|
| Task | dueAt em ≤24h | dueAt − 1h |
| Task | dueAt em ≤1h | dueAt − 15min |
| Task | dueAt em >24h | dueAt − 1h (único lembrete) |
| Event | startsAt definido | startsAt − 30min |
| Goal | neglectedSince ≥7d | alerta diário (max 1/semana) |

## Fluxo

```
CRUD task/event → ReminderSchedulerService
  → cancel PENDING existentes da entidade
  → create Reminder (PENDING)
  → enqueue delayed job reminder-dispatch

Worker (scheduledAt):
  → apply DND shift
  → load entity + user.telegramChatId
  → batch por userId
  → TelegramService.sendToUser
  → Reminder.status = SENT + NotificationLog
  → retry 2x on failure
```

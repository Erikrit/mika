# F06 — Chat Inteligente — Design

**Status:** Approved  
**Last Updated:** 2026-05-31

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Tool calling | Vercel AI SDK `tool` + `maxSteps: 5` | Dados reais sob demanda; anti-alucinação |
| Contexto leve | Data + perfil FIXED no system prompt | RAG via `search_memory` tool |
| Web streaming | SSE `POST /chat/message/stream` | First token rápido; UX conversacional |
| Telegram | `generateReplyWithTools` síncrono | Split >4096 já existe |
| Histórico longo | Summarize msgs >20 via gpt-4o-mini | Cabe na context window |
| Executors | `ChatToolExecutorService` na API | Reutiliza Tasks/Events/Memory/Finance |

## Tools

| Tool | Serviço | Story |
|------|---------|-------|
| `get_tasks` | TasksService | CHAT-01 |
| `get_events` | EventsService | CHAT-01 |
| `search_memory` | MemoryService + audit sensível | CHAT-02 |
| ~~`get_finance_goals`~~ | — | CHAT-04 adiado v2/v3 (AD-013) |
| `create_task` | TasksService.create | CHAT-05 |
| `update_task` | TasksService.update | CHAT-07 |
| `delete_task` | TasksService.remove | CHAT-07 |

## Fluxo web (SSE)

```
ai-hub.tsx → POST /chat/message/stream (Bearer JWT)
  → ChatService.streamMessage
  → streamReplyWithTools (packages/ai)
  → SSE chunks { token } → { done, sessionId, reply }
```

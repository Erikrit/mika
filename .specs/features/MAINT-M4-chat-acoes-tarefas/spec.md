# MAINT-M4 — Chat: ações de tarefa confiáveis

**Status:** Implementado (2026-05-31)  
**Gate:** `pnpm build` + UAT manual (sem jest)

## Problema

O chat afirmava criar ou excluir tarefas sem chamar tools, ou contornava exclusões com `create_task` (título "Excluir…"). Causas:

| Sintoma | Causa |
|---------|-------|
| "Tarefas criadas" sem aparecer na UI | Prompt só exigia tools para consulta; modelo respondia sem `create_task` |
| "Excluir" criava tarefas novas | Não existia `delete_task`; modelo usava `create_task` |
| Impossível validar no servidor | Sem log de tool calls no stream |

## Solução

| Aspecto | Implementação |
|---------|---------------|
| `delete_task` | Zod + tool + executor → `TasksService.remove` |
| `update_task` | Zod + tool + executor → `TasksService.update` |
| `create_task` | Descrição reforçada: só tarefas novas |
| Prompt | Regras anti-alucinação para criar/atualizar/excluir |
| Temperatura | `toolsTemperature: 0.5` em `generateReplyWithTools` / `streamReplyWithTools` |
| Logs | Pino em mutações (`ChatToolExecutorService`); agregado pós-stream (`ChatService`) |

## Distinção: exclusão de tarefa vs exclusão de conta

O edge case F06 "delete data" refere-se a **exclusão de conta/dados pessoais** — o usuário deve ir às configurações. **Não bloqueia** `delete_task` para tarefas individuais via chat.

## Decisões

| ID | Decisão |
|----|---------|
| AD-M4-01 | `complete_task` fora de escopo (P2) |
| AD-M4-02 | `maxSteps: 5` mantido; lotes grandes podem exigir follow-up do usuário |
| AD-M4-03 | Indicador visual SSE `tool_start` fora de escopo (P2) |
| AD-M4-04 | Limpeza manual de tarefas lixo pré-UAT — não automatizar |

## Tools adicionadas

| Tool | Params | Retorno |
|------|--------|---------|
| `update_task` | `taskId` (+ `title`, `dueAt`, `priority` opcionais) | `{ success, task }` ou `{ success: false, message }` |
| `delete_task` | `taskId` | `{ success, deletedId }` ou `{ success: false, message }` |

## UAT checklist

| # | Cenário | Esperado | OK |
|---|---------|----------|-----|
| 1 | "Crie tarefa X para amanhã 9h P1" | Nova linha em /tasks; resposta cita id | [ ] |
| 2 | "Crie as tarefas…" (2 itens com datas) | 2× `create_task`; 2 registros no DB | [ ] |
| 3 | "Exclua as tarefas existentes" (após listar) | Contagem diminui; nenhuma tarefa "Excluir/Deletar" | [ ] |
| 4 | "Altere vencimento da tarefa X" | `update_task` + dueAt correto na UI | [ ] |
| 5 | Telegram (mesmo fluxo) | Paridade via `generateReplyWithTools` | [ ] |
| — | `pnpm build` | api + @mika/ai + web OK | [x] |

**Pré-UAT:** apagar manualmente tarefas lixo ("Excluir tarefa…") criadas no incidente anterior.

## Referências

- Plano: `.cursor/plans/chat_tools_mutações_1bfa7563.plan.md`
- Feature base: `F06-chat-inteligente`

# F04 — Revisão Semanal — Design

**Status:** Approved  
**Last Updated:** 2026-05-31

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Neglected detection | updateMany no início de weekly-review | Campo neglectedSince já no schema Task |
| Goals neglected | Query updatedAt >7d | Goal sem neglectedSince no schema v1 |
| Semana | Dom 20:00 America/Sao_Paulo | ROADMAP + INTEGRATIONS |
| AI max | 500 palavras, gpt-4o-mini | AI-STRATEGY.md |

## Agregação semanal

- Tarefas DONE com completedAt na semana corrente (seg-dom)
- Tarefas atrasadas com dias de atraso
- Tasks com neglectedSince + Goals ACTIVE updatedAt >7d
- Eventos startsAt na próxima semana

## Detecção neglected (P2)

```typescript
// No início de weekly-review
await prisma.task.updateMany({
  where: { status IN TODO/IN_PROGRESS, updatedAt < 7d, neglectedSince null },
  data: { neglectedSince: now() },
});
```

Interação do usuário (update task/goal) limpa neglectedSince via TasksService.update (já implícito se resetar updatedAt).

## Seções do prompt AI

1. Concluídos (celebrar)
2. Atrasados (dias)
3. Perderam prioridade
4. Riscos / eventos próxima semana
5. Sugestão de foco

Sem pergunta interativa obrigatória.

# F02 — Memória de Longo Prazo — Design

**Status:** Approved  
**Last Updated:** 2026-05-31

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Indexação | Assíncrona via BullMQ | Spec < 60s; não bloqueia CRUD |
| Embeddings | text-embedding-3-small (1536) | AI-STRATEGY.md; custo baixo |
| Vector queries | Raw SQL `$queryRaw` | Prisma não suporta pgvector nativamente |
| Reflections | Descriptografar no worker | Conteúdo útil só existe decrypted |
| Events/FinanceGoals | Fora do index v1 | Spec: task/project/goal/reflection/note |
| Producer API | bullmq `Queue` direto | Worker já usa BullMQ; evita conflito com `@nestjs/bull` (Bull v4) |
| Dedup | Delete-by-source + insert | Multi-chunk por entidade; `contentHash` unique por chunk |

## Componentes

- `packages/ai`: embed, chunk, hybridRetrieve (merge/rerank puro)
- `apps/api/modules/memory`: repository SQL, service, controller, queue
- `apps/worker`: processor `memory-index`

## Fluxos

Ver plano F02 e [AI-STRATEGY.md](../../architecture/AI-STRATEGY.md).

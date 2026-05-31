# Stack — Mika

**Status:** Approved  
**Last Updated:** 2026-05-31

---

## Stack Escolhida (v1)

| Camada | Tecnologia | Versão | Papel |
|--------|------------|--------|-------|
| Frontend | Next.js | 15.x | PWA responsivo, SSR/SSG, App Router |
| UI | Tailwind CSS + shadcn/ui | latest | Componentes acessíveis e consistentes |
| Backend | NestJS | 11.x | API REST, WebSocket, módulos, DI |
| Language | TypeScript | 5.x | Tipagem end-to-end |
| ORM | Prisma | 6.x | Schema, migrations, type-safe queries |
| Database | PostgreSQL | 16 | Dados relacionais |
| Vetores | pgvector | 0.7+ | Embeddings para memória (M2) |
| Cache/Filas | Redis + BullMQ | 7.x | Cache, jobs, lembretes |
| IA | OpenAI API | — | GPT-4o-mini (rotinas), GPT-4o (complexo) |
| IA SDK | Vercel AI SDK | latest | Streaming, tool calling |
| Automação | n8n | latest | Cron rotinas manhã/meio-dia/noite |
| Bot | grammY | latest | Telegram Bot API |
| Validação | Zod | 3.x | Schemas compartilhados (packages/shared) |
| Logs | Pino | latest | Logs estruturados JSON |
| Monorepo | pnpm + Turborepo | — | Workspaces apps/ + packages/ |
| Container | Docker Compose | — | Dev e prod |
| Hospedagem | VPS Hetzner/Contabo | 4GB RAM | Self-hosted, ~€5–8/mês |

---

## Alternativas Consideradas

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **Hono** (vs NestJS) | Leve, rápido, ~30MB RAM | Menos estrutura para projeto grande | ❌ Rejeitado — ver AD-002 |
| **Supabase** (vs Postgres self-hosted) | Auth + realtime prontos | Custo mensal, vendor lock-in | ❌ Rejeitado — self-hosted preferido |
| **SQLite/Turso** (vs PostgreSQL) | Ultra barato, simples | Sem pgvector nativo maduro, escala limitada | ❌ Rejeitado |
| **Flutter** (vs Next.js PWA) | App nativo único | Duplica lógica com backend web | ❌ Adiado — PWA primeiro |
| **LangChain** (vs AI SDK) | RAG abstractions | Pesado, complexo | ⚠️ Avaliar em M2; AI SDK no MVP |
| **Evolution API WhatsApp** | Alcance WhatsApp | Risco ban, complexidade legal | ❌ Adiado |

---

## Estrutura Monorepo

```
mika/
├── apps/
│   ├── web/                 # Next.js 15 PWA
│   ├── api/                 # NestJS
│   └── worker/              # BullMQ workers
├── packages/
│   ├── shared/              # Types, Zod schemas, constants
│   ├── ai/                  # Prompts, RAG, embeddings
│   └── database/            # Prisma schema + client
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── Dockerfile.*
├── .specs/
└── docs/
```

---

## Compatibilidade Multi-dispositivo

| Dispositivo | Solução v1 | Solução futura |
|-------------|------------|----------------|
| Desktop | Next.js PWA no browser | Tauri wrapper opcional |
| Tablet | Layout responsivo Tailwind | — |
| Celular | PWA + Telegram Bot | Capacitor se push nativo |
| Offline | — | Service Worker (M2+) |

---

## Estimativa de Custo Mensal (uso pessoal)

| Item | Custo estimado |
|------|----------------|
| VPS 4GB (Hetzner CX22) | ~€5–6 |
| OpenAI (GPT-4o-mini rotinas) | ~$5–15 |
| Domínio + SSL (Let's Encrypt) | ~€1 |
| **Total** | **~R$80–150/mês** |

---

## Requisitos de Runtime

- Node.js 20 LTS
- pnpm 9+
- Docker 24+
- 4GB RAM mínimo (VPS)
- 40GB SSD

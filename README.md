# Mika — Assistente Pessoal Inteligente



Copiloto pessoal baseado em IA para organizar, priorizar, recordar e apoiar decisões — reduzindo carga mental.



## Status



**Fase atual:** Fase 5–6 concluída (M5/M6) · Foco atual: **UI do assistente** (MAINT-M2) — Finanças adiado v2/v3  

**Modelo de desenvolvimento:** [TLC Spec-Driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven)



## Acesso ao sistema



Credenciais padrão criadas pelo seed do banco (`packages/database/prisma/seed.ts`):



| Campo | Valor |

|-------|-------|

| **Email** | `erik@mika.local` |

| **Senha** | `mika@dev2026` |



> A senha pode ser alterada via variável de ambiente `SEED_USER_PASSWORD` no `.env` antes de rodar o seed.



### Como iniciar (desenvolvimento)



Checklist operacional completo:



```bash

# 1. Copiar e preencher variáveis de ambiente

cp .env.example .env

# Preencher: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY

# Opcional para IA/Telegram: OPENAI_API_KEY, TELEGRAM_BOT_TOKEN



# Gerar chaves seguras (PowerShell / Git Bash):

# openssl rand -hex 32   # ENCRYPTION_KEY

# openssl rand -hex 32   # JWT_SECRET

# openssl rand -hex 32   # JWT_REFRESH_SECRET



# 2. Subir infraestrutura

docker compose -f docker/docker-compose.yml up -d



# 3. Instalar dependências e preparar banco

pnpm install

pnpm prisma:migrate

pnpm prisma:seed



# 4. Iniciar API, worker e frontend

pnpm --filter api dev      # http://localhost:3001
pnpm --filter worker dev   # indexação memory-index (BullMQ)
pnpm --filter web dev      # http://localhost:3000

```



Acesse [http://localhost:3000/login](http://localhost:3000/login) e entre com as credenciais acima.



**Documentação da API:** [http://localhost:3001/docs](http://localhost:3001/docs) (Swagger/OpenAPI)



### Vincular Telegram



1. Faça login no app web → **Configurações**

2. Clique em **Gerar código** (válido por 10 minutos)

3. No Telegram, abra o bot Mika e envie: `/vincular CODIGO`



**Alternativa dev-only:** atualize `telegramChatId` diretamente via Prisma Studio (`pnpm prisma:studio`).



### Criar bot Telegram



1. Abra [@BotFather](https://t.me/BotFather) no Telegram

2. `/newbot` → escolha nome e username

3. Copie o token para `TELEGRAM_BOT_TOKEN` no `.env`

4. Reinicie a API

### Memória de longo prazo (F02)

Tarefas, projetos, objetivos e reflexões são indexados automaticamente pelo worker `memory-index` (embeddings + full-text). O chat e o Telegram usam RAG híbrido para responder com contexto histórico.

- **UI:** [http://localhost:3000/memories](http://localhost:3000/memories) — listagem, busca e importação de `.md`
- **API:** `GET /memory/chunks`, `POST /memory/search`, `POST /memory/import` (Swagger em `/docs`)
- **Backfill** (dados existentes antes do M2):

```bash
pnpm --filter @mika/database db:backfill-memory
```

Requer Redis, PostgreSQL com pgvector e `OPENAI_API_KEY` configurados.

### Rotinas automáticas (F03/F04)

Quatro rotinas proativas disparadas pelo n8n (ou manualmente via curl/Swagger):

| Horário | Endpoint | Descrição |
|---------|----------|-----------|
| 07:00 | `POST /routines/daily-summary` | Resumo matinal + pergunta de prioridade |
| 12:30 | `POST /routines/midday-check` | Check-in meio-dia |
| 21:00 | `POST /routines/evening-reflection` | Reflexão noturna |
| Dom 20:00 | `POST /routines/weekly-review` | Revisão semanal |

Configure `ROUTINE_API_KEY` no `.env` e importe os workflows em [docker/n8n/workflows/](docker/n8n/workflows/).

```bash
curl -X POST http://localhost:3001/routines/daily-summary \
  -H "X-Routine-Key: $ROUTINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{}"
```

Respostas às perguntas interativas no Telegram são salvas como `Reflection` (morning/midday/evening). O dashboard web exibe o resumo do dia via `GET /routines/latest?type=DAILY_SUMMARY`.

### Lembretes proativos (F05)

Tarefas e eventos geram lembretes automáticos via worker `reminder-dispatch` (BullMQ):

| Tipo | Quando dispara |
|------|----------------|
| Tarefa | 1h antes do vencimento (ou 15min se due em ≤1h) |
| Evento | 30min antes do início |
| Objetivo negligenciado | Alerta diário (max 1/semana por objetivo) |

- **Canal MVP:** Telegram (requer conta vinculada)
- **DND:** lembretes entre 22:00–07:00 são reagendados para 07:00
- **Worker:** `pnpm --filter worker dev` (junto com `memory-index`)

### Chat inteligente (F06)

Copiloto com tool calling e streaming na web:

- **Tools:** `get_tasks`, `get_events`, `search_memory`, `create_task`
- **Web:** AI Hub com resposta progressiva via `POST /chat/message/stream` (SSE)
- **Telegram:** chat livre com dados reais (sem alucinação de datas)
- **Histórico:** conversas >20 mensagens são resumidas automaticamente

> **Finanças:** módulo adiado para v2/v3 — sem aba web nem consulta financeira no chat por enquanto (API backend mantida).

Perguntas de exemplo: *"O que preciso fazer esta semana?"*, *"Lembre de ligar pro médico sexta"*.


| Documento | Descrição |

|-----------|-----------|

| [docs/SPECIFICATION-v1.md](docs/SPECIFICATION-v1.md) | Especificação original do produto |

| [docs/VISUAL-DESIGN.md](docs/VISUAL-DESIGN.md) | Design visual Companion OS — paleta, layout, componentes |

| [.specs/project/PROJECT.md](.specs/project/PROJECT.md) | Visão, goals, stack, escopo v1 |

| [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) | Milestones e features |

| [.specs/project/STATE.md](.specs/project/STATE.md) | Decisões, blockers, memória persistente |

| [.specs/project/AMBIENTE-DE-TESTE-STAGING.md](.specs/project/AMBIENTE-DE-TESTE-STAGING.md) | VPS, domínio, HTTPS, deploy staging |

| [docker/README-DEPLOY.md](docker/README-DEPLOY.md) | Build/push das imagens e compose staging |

| [.specs/architecture/](.specs/architecture/) | Stack, arquitetura, dados, segurança, IA, infra |

| [.specs/features/](.specs/features/) | Specs por feature (F01–F06 MVP) |



## Stack (v1)



- **Frontend:** Next.js 15 (PWA responsivo) — Companion OS dark premium

- **Backend:** NestJS 11

- **Database:** PostgreSQL 16 + pgvector

- **IA:** OpenAI (gpt-4o-mini via Vercel AI SDK)

- **Automação:** n8n

- **Canal MVP:** Telegram Bot

- **Infra:** Docker Compose em VPS



## Identidade visual



O Mika segue o conceito **Companion Operating System** — não um chatbot, mas um sistema operacional pessoal. Dark mode nativo, glassmorphism leve, avatar esfera luminosa e layout Header + Sidebar + Workspace + AI Hub.



Detalhes completos em [docs/VISUAL-DESIGN.md](docs/VISUAL-DESIGN.md).



## Como trabalhar neste projeto



1. Leia `.specs/project/PROJECT.md` e `STATE.md` antes de cada sessão

2. Consulte `docs/VISUAL-DESIGN.md` ao criar ou alterar telas

3. Implemente features seguindo `.specs/features/[feature]/spec.md`

4. Para features em andamento, siga `.specs/features/[feature]/tasks.md` (ex.: F02 memória)

5. Use a skill `tlc-spec-driven` no Cursor para guiar Specify → Design → Tasks → Execute



## Autor



Erik Barcelos


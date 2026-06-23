# Mika — Assistente Pessoal Inteligente



Copiloto pessoal baseado em IA para organizar, priorizar, recordar e apoiar decisões — reduzindo carga mental.



## Status



**Fase atual:** M8 concluída · **M9** — Integrações de Organização Real (próximo) · Finanças adiado v2/v3

**Modelo de desenvolvimento:** [TLC Spec-Driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven)



## Acesso ao sistema



Credenciais padrão criadas pelo seed do banco (`packages/database/prisma/seed.ts`):



| Campo | Valor |

|-------|-------|

| **Email** | `erik@mika.local` |

| **Senha** | `mika@dev2026` |



> A senha pode ser alterada via variável de ambiente `SEED_USER_PASSWORD` no `.env` antes de rodar o seed.



## Subir o sistema

### Desenvolvimento local (recomendado)

Na raiz do repositório. Use **PowerShell** no Windows ou **bash** no Linux/macOS/WSL.

**PowerShell (Windows):**

```powershell
# 1. Variáveis de ambiente (só na primeira vez)
Copy-Item .env.example .env
# Edite .env: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY
# Opcional: OPENAI_API_KEY (chat, memória, projetos por IA)

# Gerar chaves: openssl rand -hex 32

# 2. Infraestrutura (Postgres na porta 5433 + Redis)
docker compose -f docker/docker-compose.yml up -d postgres redis

# 3. Dependências e banco
pnpm install
pnpm prisma:migrate
pnpm prisma:seed

# 4. API + worker + frontend (um comando)
pnpm dev
```

**bash (Linux / macOS / Git Bash):**

```bash
cp .env.example .env
# Edite .env conforme acima

docker compose -f docker/docker-compose.yml up -d postgres redis

pnpm install
pnpm prisma:migrate
pnpm prisma:seed

pnpm dev
```

**URLs após subir:**

| Serviço | URL |
|---------|-----|
| Web (login) | http://localhost:3000/login |
| API (Swagger) | http://localhost:3001/docs |

**Terminais separados** (se preferir em vez de `pnpm dev`):

```bash
pnpm --filter api dev      # http://localhost:3001
pnpm --filter worker dev   # memory-index (BullMQ)
pnpm --filter web dev      # http://localhost:3000
```

> CRUD básico funciona sem Redis. O worker `memory-index` (padrão v1.5) requer Redis. Lembretes e Telegram são legado — ver [docker/README-LEGACY.md](docker/README-LEGACY.md).

### Build (validação / imagens Docker)

O frontend usa `output: 'standalone'` para deploy em container. No **Windows**, `pnpm --filter web build` pode falhar com `EPERM: symlink` — o sistema bloqueia symlinks sem permissão.

**Opção A — desenvolvimento:** use `pnpm dev` (não precisa de build).

**Opção B — habilitar build local no Windows:**

1. **Configurações** → **Privacidade e segurança** → **Para desenvolvedores** → ative **Modo de desenvolvedor**
2. Feche e reabra o terminal
3. Rode:

```powershell
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue
pnpm build
```

**Opção C — build via Docker (recomendado para imagem de deploy no Windows):**

```powershell
pnpm docker:build:web
# ou todas as imagens:
pnpm docker:build:all
```

Detalhes em [docker/README-DEPLOY.md](docker/README-DEPLOY.md).

### Deploy VPS v1.5 (stack enxuta)

Compose canônico: Web, API, Worker, Postgres e Redis — sem n8n/Telegram por padrão.

```bash
# Na VPS ou máquina com Docker
cp docker/.env.staging.example .env.staging
# Preencha senhas, JWT, ENCRYPTION_KEY, OPENAI_API_KEY, PUBLIC_WEB_URL

docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging pull
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging up -d

# Migrações (obrigatório após deploy ou upgrade)
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma migrate deploy"

# Seed (só em ambiente novo)
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma db seed"
```

Runbook completo: [.specs/project/AMBIENTE-DE-TESTE-STAGING.md](.specs/project/AMBIENTE-DE-TESTE-STAGING.md).

### Memória de longo prazo (F02)

Tarefas, projetos, objetivos e reflexões são indexados automaticamente pelo worker `memory-index` (embeddings + full-text). O chat web usa RAG híbrido para responder com contexto histórico.

- **UI:** [http://localhost:3000/memories](http://localhost:3000/memories) — listagem, busca e importação de `.md`
- **API:** `GET /memory/chunks`, `POST /memory/search`, `POST /memory/import` (Swagger em `/docs`)
- **Backfill** (dados existentes antes do M2):

```bash
pnpm --filter @mika/database db:backfill-memory
```

Requer Redis, PostgreSQL com pgvector e `OPENAI_API_KEY` configurados.

### Rotinas (F03/F04)

Resumo diário, check-in e revisão semanal disponíveis via `POST /routines/*`. O Dashboard exibe o resumo via `GET /routines/latest?type=DAILY_SUMMARY`. Disparo automático via n8n é **opcional** — ver [docker/README-LEGACY.md](docker/README-LEGACY.md).

### Lembretes (F05)

Canal Web Push previsto para M9. Lembretes Telegram e worker `reminder-dispatch` são **legado/opcional** — desligados por padrão no deploy v1.5.

### Chat inteligente (F06)

Copiloto com tool calling e streaming na web:

- **Tools:** `get_tasks`, `get_events`, `search_memory`, `create_task`
- **Web:** AI Hub com resposta progressiva via `POST /chat/message/stream` (SSE)
- **Web/PWA:** chat livre com dados reais (sem alucinação de datas)
- **Histórico:** conversas >20 mensagens são resumidas automaticamente

> **Finanças:** módulo adiado para v2/v3 — sem aba web nem consulta financeira no chat por enquanto (API backend mantida).

Perguntas de exemplo: *"O que preciso fazer esta semana?"*, *"Lembre de ligar pro médico sexta"*.

### Projetos inteligentes e organização (M8)

- **Projetos por IA:** em `/projects`, use **Criar com Mika** — prompt livre ou upload `.md`/`.txt`; revise o rascunho antes de confirmar.
- **API:** `POST /projects/draft`, `POST /projects/from-draft` (Swagger em `/docs`)
- **Dashboard:** foco do dia, semana, projetos ativos, timeline e resumo diário (`GET /dashboard/overview`)
- **Agenda:** eventos e tarefas com prazo na mesma linha do tempo em `/events`
- **Navegação:** aba Objetivos oculta; planejamento concentrado em Projetos (`/goals` redireciona)


| Documento | Descrição |

|-----------|-----------|

| [docs/SPECIFICATION-v1.md](docs/SPECIFICATION-v1.md) | Especificação original do produto |

| [docs/VISUAL-DESIGN.md](docs/VISUAL-DESIGN.md) | Design visual Companion OS — paleta, layout, componentes |

| [.specs/project/PROJECT.md](.specs/project/PROJECT.md) | Visão, goals, stack, escopo v1 |

| [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) | Milestones e features |

| [.specs/project/STATE.md](.specs/project/STATE.md) | Decisões, blockers, memória persistente |

| [.specs/project/AMBIENTE-DE-TESTE-STAGING.md](.specs/project/AMBIENTE-DE-TESTE-STAGING.md) | VPS, domínio, HTTPS, deploy staging |

| [docker/README-DEPLOY.md](docker/README-DEPLOY.md) | Deploy v1.5 (compose canônico) |
| [docker/README-LEGACY.md](docker/README-LEGACY.md) | Telegram e n8n (legado opcional) |

| [.specs/architecture/](.specs/architecture/) | Stack, arquitetura, dados, segurança, IA, infra |

| [.specs/features/](.specs/features/) | Specs por feature (F01–F06 MVP) |



## Stack (v1)



- **Frontend:** Next.js 15 (PWA responsivo) — Companion OS dark premium

- **Backend:** NestJS 11

- **Database:** PostgreSQL 16 + pgvector

- **IA:** OpenAI (gpt-4o-mini via Vercel AI SDK)

- **Automação:** rotinas via API; n8n opcional (legado)
- **Canal principal:** Web/PWA responsivo

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


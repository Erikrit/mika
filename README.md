# Mika — Assistente Pessoal Inteligente

Copiloto pessoal baseado em IA para organizar, priorizar, recordar e apoiar decisões — reduzindo carga mental.

## Status

**Fase atual:** Fase 1 — Fundação (UI Companion OS + API central)  
**Modelo de desenvolvimento:** [TLC Spec-Driven](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven)

## Acesso ao sistema

Credenciais padrão criadas pelo seed do banco (`packages/database/prisma/seed.ts`):

| Campo | Valor |
|-------|-------|
| **Email** | `erik@mika.local` |
| **Senha** | `mika@dev2026` |

> A senha pode ser alterada via variável de ambiente `SEED_USER_PASSWORD` no `.env` antes de rodar o seed.

### Como iniciar (desenvolvimento)

```bash
# 1. Subir infraestrutura
docker compose -f docker/docker-compose.yml up -d

# 2. Instalar dependências e preparar banco
pnpm install
pnpm prisma:migrate
pnpm prisma:seed

# 3. Iniciar API e frontend
pnpm --filter api dev    # http://localhost:3001
pnpm --filter web dev    # http://localhost:3000
```

Acesse [http://localhost:3000/login](http://localhost:3000/login) e entre com as credenciais acima.

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/SPECIFICATION-v1.md](docs/SPECIFICATION-v1.md) | Especificação original do produto |
| [docs/VISUAL-DESIGN.md](docs/VISUAL-DESIGN.md) | Design visual Companion OS — paleta, layout, componentes |
| [.specs/project/PROJECT.md](.specs/project/PROJECT.md) | Visão, goals, stack, escopo v1 |
| [.specs/project/ROADMAP.md](.specs/project/ROADMAP.md) | Milestones e features |
| [.specs/project/STATE.md](.specs/project/STATE.md) | Decisões, blockers, memória persistente |
| [.specs/architecture/](.specs/architecture/) | Stack, arquitetura, dados, segurança, IA, infra |
| [.specs/features/](.specs/features/) | Specs por feature (F01–F06 MVP) |

## Stack (v1)

- **Frontend:** Next.js 15 (PWA responsivo) — Companion OS dark premium
- **Backend:** NestJS 11
- **Database:** PostgreSQL 16 + pgvector
- **IA:** OpenAI
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
4. Para Fase 1, siga `.specs/features/F01-centralizacao/tasks.md`
5. Use a skill `tlc-spec-driven` no Cursor para guiar Specify → Design → Tasks → Execute

## Autor

Erik Barcelos

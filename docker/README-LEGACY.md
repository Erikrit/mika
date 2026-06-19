# Legado — Telegram e n8n (fora do deploy v1.5)

Integrações legadas **não fazem parte** do deploy padrão v1.5 (`docker-compose.v1.5.yml`). Use este guia apenas se precisar reativar Telegram ou rotinas automáticas via n8n.

---

## Pré-requisitos

- Stack principal rodando (Postgres, Redis, API, Web, Worker)
- Variáveis no `.env` / `.env.staging`

---

## Telegram (bot + lembretes)

### Flags necessárias

```bash
MIKA_TELEGRAM_MODULE_ENABLED=true
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=<token do BotFather>
TELEGRAM_WEBHOOK_SECRET=<opcional em produção>
```

### Worker (lembretes Telegram)

```bash
WORKER_REMINDER_DISPATCH_ENABLED=true
MIKA_REMINDERS_ENABLED=true
```

Reinicie API e worker após alterar as flags.

### Vincular conta

1. Habilite `MIKA_TELEGRAM_MODULE_ENABLED=true` e reinicie a API
2. Faça login no app web → **Configurações** → **Gerar código** (endpoint `POST /auth/telegram/code`)
3. No Telegram, envie ao bot: `/vincular CODIGO`

**Alternativa dev:** atualize `telegramChatId` via Prisma Studio.

### Criar bot

1. Abra [@BotFather](https://t.me/BotFather) no Telegram
2. `/newbot` → copie o token para `TELEGRAM_BOT_TOKEN`
3. Em produção, configure webhook apontando para `/telegram/webhook`

---

## n8n (rotinas automáticas)

O n8n **não** sobe no compose v1.5. Use o compose legado:

```bash
docker compose -f docker/docker-compose.legacy.yml up -d
```

Acesse http://localhost:5678 (credenciais via `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD`).

### Importar workflows

1. Configure `ROUTINE_API_KEY` no `.env` (mesmo valor no n8n: Settings → Variables)
2. Abra n8n → **Workflows** → **Import from File**
3. Importe os JSON em [docker/n8n/workflows/](docker/n8n/workflows/)

| Horário | Arquivo | Endpoint |
|---------|---------|----------|
| 07:00 | `daily-summary.json` | `POST /routines/daily-summary` |
| 12:30 | `midday-check.json` | `POST /routines/midday-check` |
| 21:00 | `evening-reflection.json` | `POST /routines/evening-reflection` |
| Dom 20:00 | `weekly-review.json` | `POST /routines/weekly-review` |

Header obrigatório: `X-Routine-Key: $ROUTINE_API_KEY`

### Disparo manual (sem n8n)

```bash
curl -X POST http://localhost:3001/routines/daily-summary \
  -H "X-Routine-Key: $ROUTINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{}"
```

Com Telegram desligado, rotinas são gravadas com canal `WEB` e exibidas no Dashboard via `GET /routines/latest`.

---

## Remoção definitiva

Prevista para **M9 (Web Push)** — ver `.specs/project/AD-017-limpeza-legado-v15.md` e Fase 6 do plano de limpeza.

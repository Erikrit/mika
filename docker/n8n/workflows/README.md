# n8n Workflows — Rotinas Mika (legado opcional)

Workflows versionados para import manual no n8n UI. **Fora do deploy v1.5** — ver [docker/README-LEGACY.md](../../README-LEGACY.md).

## Pré-requisitos

1. API rodando em `http://localhost:3001` (ou `host.docker.internal:3001` a partir do container n8n)
2. Variável `ROUTINE_API_KEY` no `.env` (mesmo valor no n8n: Settings → Variables → `ROUTINE_API_KEY`)
3. n8n via `docker compose -f docker/docker-compose.legacy.yml up -d` → http://localhost:5678

## Import

1. Abra n8n → **Workflows** → **Import from File**
2. Importe cada JSON desta pasta
3. Ative os workflows (toggle Active)

## Workflows

| Arquivo | Cron (America/Sao_Paulo) | Endpoint |
|---------|--------------------------|----------|
| `daily-summary.json` | 07:00 diário | POST `/routines/daily-summary` |
| `midday-check.json` | 12:30 diário | POST `/routines/midday-check` |
| `evening-reflection.json` | 21:00 diário | POST `/routines/evening-reflection` |
| `weekly-review.json` | Dom 20:00 | POST `/routines/weekly-review` |
| `health-check.json` | */5 min | GET `/health` |

Todos os POSTs enviam header `X-Routine-Key: {{ $env.ROUTINE_API_KEY }}`.

## Teste manual (sem n8n)

```bash
curl -X POST http://localhost:3001/routines/daily-summary \
  -H "X-Routine-Key: $ROUTINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{}"
```

Ou via Swagger: http://localhost:3001/docs → tag **routines**.

Com Telegram desligado, rotinas são gravadas com canal `WEB` e exibidas no Dashboard.

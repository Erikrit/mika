# Infrastructure — Mika

**Status:** Draft  
**Last Updated:** 2026-05-31

---

## Ambiente Alvo

| Ambiente | Onde | Uso |
|----------|------|-----|
| `development` | Local (Docker Compose) | Dev diário |
| `staging` | VPS ou local | Testes pré-prod |
| `production` | VPS Hetzner CX22 (4GB) | Uso real |

---

## Docker Compose (Produção)

```yaml
# docker/docker-compose.prod.yml (estrutura alvo)
services:
  postgres:
    image: pgvector/pgvector:pg16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: mika
      POSTGRES_USER: mika
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes: [redisdata:/data]

  api:
    build: ./apps/api
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://mika:${DB_PASSWORD}@postgres:5432/mika
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
    ports: ["3001:3001"]

  web:
    build: ./apps/web
    depends_on: [api]
    environment:
      NEXT_PUBLIC_API_URL: https://api.mika.local
    ports: ["3000:3000"]

  worker:
    build: ./apps/worker
    depends_on: [postgres, redis]

  n8n:
    image: n8nio/n8n
    volumes: [n8ndata:/home/node/.n8n]
    ports: ["5678:5678"]

  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile, caddydata:/data]
```

---

## Recursos VPS Recomendados

| Recurso | M1 (Fase 1) | M3+ (com n8n + worker) |
|---------|-------------|------------------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 vCPU | 4 vCPU |
| Disco | 40 GB SSD | 80 GB SSD |
| Custo | ~€5/mês | ~€10/mês |

**Provedores:** Hetzner CX22, Contabo VPS S, DigitalOcean Basic

---

## Variáveis de Ambiente

```bash
# .env.example
DATABASE_URL=postgresql://mika:password@localhost:5432/mika
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ENCRYPTION_KEY=...          # AES-256 para reflections
NODE_ENV=development
API_PORT=3001
WEB_PORT=3000
N8N_WEBHOOK_URL=http://n8n:5678
TZ=America/Sao_Paulo
```

---

## Health Checks

| Serviço | Endpoint | Intervalo |
|---------|----------|-----------|
| API | GET /health | 30s |
| PostgreSQL | pg_isready | 30s |
| Redis | PING | 30s |
| Worker | BullMQ queue depth | 60s |

Resposta `/health`:

```json
{
  "status": "ok",
  "services": {
    "database": "ok",
    "redis": "ok",
    "openai": "ok"
  },
  "uptime": 86400
}
```

---

## Backup

```bash
# Cron diário 03:00 (VPS)
0 3 * * * pg_dump -U mika mika | gzip > /backups/mika-$(date +\%Y\%m\%d).sql.gz
# Retenção: find /backups -mtime +7 -delete
```

Opcional: sync para Backblaze B2 ou S3 (~$1/mês).

---

## Deploy (Manual v1)

```bash
git pull origin main
docker compose -f docker/docker-compose.prod.yml build
docker compose -f docker/docker-compose.prod.yml up -d
docker compose exec api npx prisma migrate deploy
```

CI/CD (GitHub Actions) adiado para M2.

---

## Observabilidade

| Ferramenta | Uso | Fase |
|------------|-----|------|
| Pino (logs JSON) | Application logs | M1 |
| Docker logs | Container stdout | M1 |
| Uptime Kuma | Uptime monitoring (self-hosted) | M2 |
| Grafana + Prometheus | Métricas (latência, tokens/dia) | M3 |

**Métricas chave:**

- Latência P95 chat
- Tokens OpenAI/dia
- Jobs BullMQ failed count
- Rotinas n8n success rate

---

## Domínio e SSL

- Domínio: `mika.seudominio.com.br` (ou subdomínio)
- SSL: Caddy auto HTTPS ou Certbot + Nginx
- Subdomínios: `api.`, `n8n.` (n8n protegido por auth básica)

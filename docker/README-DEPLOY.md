# Deploy — Docker (staging / VPS)

## Compose canônico (v1.5)

**Deploy padrão:** `docker/docker-compose.v1.5.yml` — Web, API, Worker, Postgres e Redis apenas.

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging up -d
```

Legado (Telegram, n8n): [README-LEGACY.md](./README-LEGACY.md)

---

## Imagens do projeto

| Imagem | Registry (padrão) | Dockerfile |
|--------|---------------------|------------|
| API | `mikaassit/mika-api:staging` | `docker/Dockerfile.api` |
| Web | `mikaassit/mika-web:staging` | `docker/Dockerfile.web` |
| Worker | `mikaassit/mika-worker:staging` | `docker/Dockerfile.worker` |

Imagens oficiais no compose: `pgvector/pgvector:pg16`, `redis:7-alpine`. Caddy apenas em `docker-compose.staging.yml` (domínio + HTTPS).

---

## Build e push (na sua máquina)

Na **raiz do monorepo**:

```bash
docker build -f docker/Dockerfile.api -t mikaassit/mika-api:staging .
docker build -f docker/Dockerfile.web -t mikaassit/mika-web:staging .
docker build -f docker/Dockerfile.worker -t mikaassit/mika-worker:staging .

docker login
docker push mikaassit/mika-api:staging
docker push mikaassit/mika-web:staging
docker push mikaassit/mika-worker:staging
```

> A web usa proxy same-origin (`/backend/*`). **Uma única imagem** serve local, staging e produção — `INTERNAL_API_URL` é definido em runtime no compose (`http://api:3001`).

---

## Subir na VPS v1.5 enxuta

1. Instalar Docker + Compose na VPS.
2. Liberar portas **3000** (web) e **3001** (api) no firewall.
3. Copiar `docker/.env.staging.example` → `.env.staging`.

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging pull
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging up -d
```

4. Migrações:

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma migrate deploy"
```

5. Seed (ambiente novo):

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma db seed"
```

6. Smoke: `.specs/project/SMOKE-STAGING.md`

Runbook completo: `.specs/project/AMBIENTE-DE-TESTE-STAGING.md`.

---

## Staging com domínio + HTTPS (opcional)

Use `docker-compose.staging.yml` + Caddy quando tiver domínio próprio. Arquivo marcado como **DEPRECATED** como caminho principal — preferir v1.5 + reverse proxy externo quando possível.

```bash
docker compose -f docker/docker-compose.staging.yml --env-file .env.staging up -d
```

---

## Compose local (build na máquina)

Infra apenas (recomendado para dev):

```bash
docker compose -f docker/docker-compose.yml up -d
pnpm dev
```

Build completo local (sem n8n):

```bash
cp .env.example .env
docker compose -f docker/docker-compose.prod.yml up -d --build postgres redis api web worker
```

---

## Composes deprecados

| Arquivo | Status | Substituto |
|---------|--------|------------|
| `docker-compose.staging.hostinger.yml` | DEPRECATED | `docker-compose.v1.5.yml` |
| `docker-compose.staging.yml` | DEPRECATED (exceto Caddy/HTTPS) | `docker-compose.v1.5.yml` |

---

## Referências

- Legado Telegram/n8n: [README-LEGACY.md](./README-LEGACY.md)
- Runbook staging: `.specs/project/AMBIENTE-DE-TESTE-STAGING.md`
- Fechamento v1 / UAT: `.specs/project/V1-FECHAMENTO.md`

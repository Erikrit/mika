# Deploy — Docker (staging / VPS)

## Imagens do projeto

| Imagem | Registry (padrão) | Dockerfile |
|--------|---------------------|------------|
| API | `mikaassit/mika-api:staging` | `docker/Dockerfile.api` |
| Web | `mikaassit/mika-web:staging` | `docker/Dockerfile.web` |
| Worker | `mikaassit/mika-worker:staging` | `docker/Dockerfile.worker` |

Imagens oficiais no compose (sem build): `pgvector/pgvector:pg16`, `redis:7-alpine`, `caddy:2-alpine`.

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

**PowerShell:**

```powershell
docker build -f docker/Dockerfile.api -t mikaassit/mika-api:staging .
docker build -f docker/Dockerfile.web -t mikaassit/mika-web:staging .
docker build -f docker/Dockerfile.worker -t mikaassit/mika-worker:staging .
docker push mikaassit/mika-api:staging
docker push mikaassit/mika-web:staging
docker push mikaassit/mika-worker:staging
```

> A web usa proxy same-origin (`/backend/*`). **Uma única imagem** serve local, staging e produção — `INTERNAL_API_URL` é definido em runtime no compose (`http://api:3001`).

---

## Subir na VPS (staging)

### Hostinger sem domínio (`srv1727136.hstgr.cloud`)

1. Instalar Docker + Compose na VPS.
2. Liberar portas **3000** (web) e **3001** (api) no firewall.
3. Copiar `docker/.env.staging.example` → `.env.staging` (URLs já apontam para `srv1727136.hstgr.cloud`).

```bash
docker compose -f docker/docker-compose.staging.hostinger.yml --env-file .env.staging pull
docker compose -f docker/docker-compose.staging.hostinger.yml --env-file .env.staging up -d
```

Runbook completo: `.specs/project/AMBIENTE-DE-TESTE-STAGING.md`.

### Com domínio próprio + HTTPS (futuro)

1. DNS `WEB_DOMAIN` / `API_DOMAIN` → IP da VPS.
2. Usar `docker-compose.staging.yml` + Caddy.

```bash
docker compose -f docker/docker-compose.staging.yml --env-file .env.staging pull
docker compose -f docker/docker-compose.staging.yml --env-file .env.staging up -d
```

5. Migrações:

```bash
docker compose -f docker/docker-compose.staging.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma migrate deploy"
```

6. Seed (ambiente novo de teste):

```bash
docker compose -f docker/docker-compose.staging.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma db seed"
```

7. Smoke: `.specs/project/SMOKE-STAGING.md`

---

## Compose local (build na máquina)

```bash
cp .env.example .env
# Ajustar DATABASE_URL, REDIS_PASSWORD, INTERNAL_API_URL (se necessário), etc.

docker compose -f docker/docker-compose.prod.yml up -d --build postgres redis api web worker
# Sem n8n: não incluir o serviço n8n na linha de comando
```

---

## Referências

- Runbook completo: `.specs/project/AMBIENTE-DE-TESTE-STAGING.md`
- Fechamento v1 / UAT: `.specs/project/V1-FECHAMENTO.md`

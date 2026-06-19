# Ambiente de Teste (Staging) — Hostinger VPS

**VPS atual:** `srv1727136.hstgr.cloud` (Hostinger KVM — **sem domínio próprio por enquanto**)  
**Objetivo:** Subir Mika em staging com imagens Docker Hub (`mikaassit/*`).  
**Escopo:** api + web + worker + postgres + redis — **sem n8n**, **sem Caddy** (acesso por **portas HTTP**).

| Serviço | URL de acesso |
|---------|----------------|
| **Web** | http://srv1727136.hstgr.cloud:3000 |
| **API** | http://srv1727136.hstgr.cloud:3001 |
| **Swagger** | http://srv1727136.hstgr.cloud:3001/docs |

Arquivos:
- `docker/docker-compose.v1.5.yml` — compose canônico para este cenário
- `docker/.env.staging.example` — template de variáveis
- `docker/README-DEPLOY.md` — build/push das imagens
- `docker/README-LEGACY.md` — Telegram/n8n (opcional, fora do deploy padrão)

> Quando tiver domínio próprio, use `docker/docker-compose.staging.yml` + Caddy (HTTPS). Ver seção [Futuro: domínio + HTTPS](#futuro-domínio--https).

---

## Passo a passo — subir na VPS

### 1) Conectar na VPS

No painel Hostinger, copie o IP e usuário SSH (geralmente `root`).

```bash
ssh root@srv1727136.hstgr.cloud
# ou: ssh root@IP_DA_VPS
```

### 2) Instalar Docker (se ainda não tiver)

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl
curl -fsSL https://get.docker.com | sh
docker compose version
```

### 3) Liberar portas no firewall

Na VPS (ufw) e/ou no **firewall do painel Hostinger**:

| Porta | Uso |
|-------|-----|
| 22 | SSH |
| 3000 | Web (Next.js) |
| 3001 | API (NestJS) |

```bash
ufw allow 22
ufw allow 3000
ufw allow 3001
ufw enable
```

Não exponha Postgres (5432) nem Redis (6379) na internet.

### 4) Clonar o repositório na VPS

```bash
mkdir -p /opt/mika && cd /opt/mika
git clone https://github.com/SEU_USUARIO/mika.git .
# Se o repo for privado, use deploy key ou token
```

Alternativa mínima: copiar só `docker/` + `.env.staging` via SCP.

### 5) Criar `.env.staging`

```bash
cp docker/.env.staging.example .env.staging
nano .env.staging
```

Valores para **esta VPS** (sem domínio):

```bash
VPS_HOST=srv1727136.hstgr.cloud

MIKA_API_IMAGE=mikaassit/mika-api:staging
MIKA_WEB_IMAGE=mikaassit/mika-web:staging
MIKA_WORKER_IMAGE=mikaassit/mika-worker:staging

PUBLIC_WEB_URL=http://srv1727136.hstgr.cloud:3000
PUBLIC_API_URL=http://srv1727136.hstgr.cloud:3001

POSTGRES_USER=mika
POSTGRES_PASSWORD=<senha-forte>
POSTGRES_DB=mika
DATABASE_URL=postgresql://mika:<senha-forte>@postgres:5432/mika

REDIS_PASSWORD=<senha-forte>

JWT_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
ENCRYPTION_KEY=<openssl rand -hex 32>

OPENAI_API_KEY=sk-...

# Telegram desligado por padrão (v1.5) — ver docker/README-LEGACY.md para reativar
MIKA_TELEGRAM_MODULE_ENABLED=false
MIKA_REMINDERS_ENABLED=false
```

> **Importante:** a imagem `mika-web` deve ter sido buildada com  
> `NEXT_PUBLIC_API_URL=http://srv1727136.hstgr.cloud:3001`  
> (ver passo 0 abaixo). Se a web foi buildada com `localhost`, refaça o build e o push.

### 6) Login no Docker Hub e subir os containers

```bash
cd /opt/mika
docker login
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging pull
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging up -d
```

Verificar:

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging ps
docker logs mika-api --tail 50
docker logs mika-web --tail 50
```

### 7) Rodar migrações do banco

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma migrate deploy"
```

### 8) Seed (primeira vez no staging)

```bash
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma db seed"
```

Credenciais padrão do seed: ver `README.md` (`erik@mika.local` / senha do seed).

### 9) Validar no navegador

1. Abrir http://srv1727136.hstgr.cloud:3000/login  
2. Fazer login  
3. Abrir http://srv1727136.hstgr.cloud:3001/docs  
4. Testar AI Hub (chat)  
5. Checklist: `.specs/project/SMOKE-STAGING.md` (adaptar URLs para `:3000` e `:3001`)

### 10) Vincular Telegram (opcional)

1. No app: **Configurações** → Gerar código  
2. No bot: `/vincular CODIGO`

---

## Passo 0 — Antes da VPS (na sua máquina)

Se ainda não publicou as imagens com a URL correta da API:

```powershell
cd "d:\projeto develop\mika"
$env:NEXT_PUBLIC_API_URL = "http://srv1727136.hstgr.cloud:3001"

docker build -f docker/Dockerfile.api -t mikaassit/mika-api:staging .
docker build -f docker/Dockerfile.web --build-arg NEXT_PUBLIC_API_URL=$env:NEXT_PUBLIC_API_URL -t mikaassit/mika-web:staging .
docker build -f docker/Dockerfile.worker -t mikaassit/mika-worker:staging .

docker push mikaassit/mika-api:staging
docker push mikaassit/mika-web:staging
docker push mikaassit/mika-worker:staging
```

Detalhes: `docker/README-DEPLOY.md`.

---

## Imagens necessárias

| Imagem | Tag |
|--------|-----|
| `mikaassit/mika-api` | `:staging` |
| `mikaassit/mika-web` | `:staging` |
| `mikaassit/mika-worker` | `:staging` |

Oficiais (pull automático): `pgvector/pgvector:pg16`, `redis:7-alpine`.

---

## Redeploy (atualizar versão)

```bash
cd /opt/mika
git pull
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging pull
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging up -d
docker compose -f docker/docker-compose.v1.5.yml --env-file .env.staging exec api \
  sh -c "cd packages/database && npx prisma migrate deploy"
```

---

## Futuro: domínio + HTTPS

Quando tiver domínio (ex.: `mika.seudominio.com`):

1. Apontar DNS `A` para o IP da VPS.  
2. Usar `docker/docker-compose.staging.yml` + `docker/Caddyfile`.  
3. Rebuild da web com `NEXT_PUBLIC_API_URL=https://api.seudominio.com`.  
4. Fechar portas 3000/3001 no firewall público (só 80/443 via Caddy).

---

## Iteração 2 (opcional): n8n

- Usar `docker/docker-compose.legacy.yml` — ver `docker/README-LEGACY.md`.
- Workflows em `docker/n8n/workflows/`.
- Variável `ROUTINE_API_KEY` no `.env.staging`.

---

## Backup Postgres

```bash
mkdir -p /backups
docker exec mika-postgres-staging pg_dump -U mika mika | gzip > /backups/mika-$(date +%Y%m%d).sql.gz
```

Retenção sugerida: 7 dias.

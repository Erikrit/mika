# Ambiente de Teste (Staging) — VPS + Domínio + HTTPS

**Objetivo:** Subir um ambiente de teste (pré-prod) do Mika em VPS com **domínio + HTTPS**, usando Docker Compose, para validar a v1 antes de uso real.  
**Escopo do 1º ciclo:** **web + api + worker + postgres + redis**, **sem n8n** (opcional depois).

Base: `.specs/architecture/INFRA.md` e `docker/docker-compose.prod.yml`.

---

## 0) Pré-requisitos e decisões

- **VPS**: recomendado 4GB RAM / 2 vCPU / 40GB SSD (staging).  
- **Domínios** (exemplo):
  - `web.staging.seudominio.com` → Web (Next.js)
  - `api.staging.seudominio.com` → API (NestJS)
- **HTTPS**: recomendado via **Caddy** (auto TLS).
- **Acesso**: staging deve ser restrito (IP allowlist e/ou auth) — especialmente API e DB.

---

## 1) Provisionamento da VPS (base)

### 1.1 Criar usuário e hardening básico
- Atualizar pacotes do sistema.
- Criar usuário não-root (ex.: `mika`) e habilitar login por chave SSH.
- Ajustar firewall:
  - Liberar **80/443** (Caddy)
  - Liberar **22** (SSH) restrito ao seu IP
  - **Não expor** Postgres/Redis (apenas rede Docker interna)

### 1.2 Instalar Docker e Docker Compose
- Instalar Docker Engine + plugin do Compose.
- Confirmar que `docker` e `docker compose` funcionam.

---

## 2) DNS do staging

No provedor DNS:
- Criar `A` record para `web.staging.seudominio.com` apontando para o IP da VPS.
- Criar `A` record para `api.staging.seudominio.com` apontando para o IP da VPS.

Aguardar propagação (pode levar minutos).

---

## 3) Preparar repositório e arquivos na VPS

### 3.1 Obter o código
Opções (escolha uma):
- `git clone` do repositório (recomendado).
- Copiar via SCP/rsync.

### 3.2 Criar arquivo de ambiente do staging

Criar um `.env.staging` na raiz (ou no diretório do deploy) com **valores fortes**:

- **Banco**
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`
  - `DATABASE_URL=postgresql://...` (host `postgres`, porta `5432`)
- **Redis**
  - `REDIS_PASSWORD`
  - `REDIS_URL=redis://:REDIS_PASSWORD@redis:6379`
- **Auth/Cripto**
  - `JWT_SECRET` (32 bytes hex)
  - `JWT_REFRESH_SECRET` (32 bytes hex)
  - `ENCRYPTION_KEY` (32 bytes hex; AES-256)
- **IA/Telegram**
  - `OPENAI_API_KEY` (staging)
  - `TELEGRAM_BOT_TOKEN` (opcional no staging; se não configurar, chat Telegram não valida)
- **Web**
  - `NEXT_PUBLIC_API_URL=https://api.staging.seudominio.com`

> Geração de secrets (exemplo): `openssl rand -hex 32`

---

## 4) Subir stack do staging (sem n8n no 1º ciclo)

O arquivo existente `docker/docker-compose.prod.yml` inclui `n8n`. Para o **1º ciclo de staging**, recomenda-se uma das abordagens:

### Opção A (recomendada): usar `--profile`/override (quando disponível)
- Criar um compose de override (ex.: `docker/docker-compose.staging.yml`) removendo o serviço `n8n`.

### Opção B (simples): subir somente os serviços necessários
- Subir explicitamente `postgres redis api web worker` (sem subir `n8n`).

> O objetivo é validar v1 sem a camada de rotinas automatizadas por n8n no primeiro ciclo.

---

## 5) Proxy HTTPS (Caddy) — recomendado

### 5.1 Subir Caddy como reverse proxy
Configurar Caddy para:
- Terminar TLS para `web.staging...` e `api.staging...`
- Encaminhar:
  - `web.staging...` → `mika-web:3000`
  - `api.staging...` → `mika-api:3001`

### 5.2 Restrições recomendadas em staging
- Proteger a API em staging (ex.: basic auth ou IP allowlist no proxy) se o ambiente ficar público.
- Evitar que `/docs` fique aberto sem proteção.

---

## 6) Migrações e seed (staging)

Após os containers subirem:
- Rodar migrações no container da API: `prisma migrate deploy`
- Rodar seed se for um ambiente novo (apenas staging): `prisma db seed`

> O staging deve ter dados “de teste” controlados para validar o chat e UAT.

---

## 7) Smoke pós-deploy (staging)

Executar o smoke completo em `.specs/project/SMOKE-STAGING.md`.

---

## 8) Iteração 2 (opcional): habilitar n8n

Quando o 1º ciclo estiver OK:
- Subir `n8n` com auth básica (já previsto em `docker/docker-compose.prod.yml`)
- Ajustar `N8N_WEBHOOK_URL` para o domínio do staging
- Importar workflows de `docker/n8n/workflows/`
- Validar rotinas chamando endpoints `/routines/*` com `X-Routine-Key`


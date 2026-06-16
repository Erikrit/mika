# Plano — VPS enxuta para Mika v1.5

**Criado em:** 2026-06-16  
**Motivo:** A V1 estava lenta e chegou a travar a VPS antes das últimas alterações. A v1.5 deve subir em container usando somente o que será utilizado nesta versão.

---

## Diagnóstico

### Serviços encontrados

| Serviço | Situação atual | Necessário na v1.5? | Observação |
|---|---|---:|---|
| Web/Next | Core | Sim | Canal principal da Mika. |
| API/Nest | Core | Sim | CRUD, chat, dashboard, agenda, projetos, memória. |
| PostgreSQL + pgvector | Core | Sim | Banco principal + busca vetorial. |
| Redis | Core com restrição | Sim | Necessário para BullMQ/memória/lembretes, mas deve ter limite. |
| Worker | Core com restrição | Sim | Necessário para `memory-index`; lembretes Telegram devem ser desligados na v1.5. |
| n8n | Opcional/legado | Não | Ainda aparece em `docker-compose.yml` e `docker-compose.prod.yml`. Pode consumir memória relevante. |
| Telegram | Legado | Não | Ainda é carregado pela API e usado por rotinas/lembretes. Deve ficar desligado por padrão. |
| Caddy | Opcional | Depende | Usar apenas quando houver domínio/HTTPS. Sem domínio, expor web/api por portas. |

### Pontos críticos

- `docker-compose.prod.yml` ainda sobe `n8n` se usado sem selecionar serviços explicitamente.
- `docker/.env.staging.example` define `TELEGRAM_ENABLED=true`, contrário à decisão AD-016.
- `AppModule` carrega `TelegramModule` sempre, mesmo quando `TELEGRAM_ENABLED=false`.
- `RoutinesModule` importa `TelegramModule`, e `RoutinesService` tenta entregar rotina por Telegram.
- `ReminderSchedulerService` cria lembretes com `channel: 'TELEGRAM'`.
- `Worker` inicia sempre `neglected-tasks`, `memory-index`, `reminder-dispatch` e timer diário de objetivos negligenciados.
- Docker Compose não define limites de CPU/memória ou política de logs. Em VPS pequena, isso aumenta risco de travamento.

---

## Stack alvo v1.5

### Subir por padrão

```text
web
api
worker
postgres
redis
```

### Não subir na v1.5

```text
n8n
telegram bot/polling/webhook
gmail/google calendar/microsoft todo
web push até a implementação estar pronta
caddy enquanto não houver domínio/HTTPS
```

### Funções mantidas

- Login e uso Web/PWA.
- Tarefas, Projetos, Agenda, Dashboard, Reflexões e Memória.
- Chat/AI Hub.
- Upload/importação de memória e projetos por prompt/arquivo.
- Indexação assíncrona de memória via worker.

### Funções pausadas

- Entrega de lembretes por Telegram.
- Rotinas automáticas via n8n.
- Resumos enviados externamente.
- Alertas de objetivos negligenciados por Telegram.

---

## Plano de alteração

## Fase 1 — Container mínimo e flags operacionais

### Objetivo

Garantir que a VPS suba apenas a stack essencial e que integrações legadas fiquem desligadas por padrão.

### Alterações propostas

- Criar `docker/docker-compose.v1.5.yml` ou ajustar o compose de staging para ser explicitamente v1.5 slim.
- Remover `n8n` do compose principal/prod ou movê-lo para `docker-compose.n8n.yml`.
- Atualizar `docker/.env.staging.example`:
  - `TELEGRAM_ENABLED=false`
  - `ROUTINE_API_KEY=` vazio por padrão
  - adicionar flags:
    - `MIKA_TELEGRAM_MODULE_ENABLED=false`
    - `MIKA_REMINDERS_ENABLED=false`
    - `MIKA_ROUTINES_AUTOMATION_ENABLED=false`
    - `WORKER_MEMORY_INDEX_ENABLED=true`
    - `WORKER_REMINDER_DISPATCH_ENABLED=false`
    - `WORKER_NEGLECTED_JOBS_ENABLED=false`
- Adicionar limites no compose:
  - `api`: memória entre 512MB e 768MB
  - `web`: memória entre 384MB e 512MB
  - `worker`: memória entre 384MB e 512MB
  - `postgres`: memória entre 768MB e 1GB, conforme tamanho da VPS
  - `redis`: `--maxmemory 128mb --maxmemory-policy noeviction`
- Adicionar rotação de logs Docker:
  - `max-size: 10m`
  - `max-file: 3`

### Resultado esperado

Menos containers, menos processos permanentes e menor chance de a VPS ficar sem memória.

---

## Fase 2 — Desacoplar Telegram do runtime principal

### Objetivo

Não carregar o módulo Telegram na API quando a v1.5 estiver em modo Web/PWA.

### Alterações propostas

- Tornar `TelegramModule` opcional no `AppModule` via módulo dinâmico ou composição condicional.
- Remover dependência direta `RoutinesModule -> TelegramModule`.
- Criar abstração simples de entrega de rotina:
  - `WEB_ONLY`: salva `RoutineRun`, aparece no Dashboard, não envia mensagem externa.
  - `TELEGRAM`: modo legado, só quando habilitado explicitamente.
- Atualizar `RoutinesService.deliverRoutine` para usar canal configurável e não depender de `TelegramService`.
- Atualizar docs para deixar `/telegram/webhook` fora do smoke da v1.5.

### Resultado esperado

API inicia com menos dependências, menos risco de chamadas externas e menos acoplamento com canal legado.

---

## Fase 3 — Reduzir worker na v1.5

### Objetivo

Manter só o worker necessário para indexação de memória na v1.5.

### Alterações propostas

- No `apps/worker/src/index.ts`, iniciar workers por flag:
  - `memory-index`: ligado por padrão.
  - `reminder-dispatch`: desligado por padrão até Web Push.
  - `neglected-tasks`: desligado por padrão ou migrado para rotina manual.
  - `neglected goals timer`: desligado por padrão.
- Reduzir concorrência padrão:
  - `MEMORY_INDEX_CONCURRENCY=1`
  - `REMINDER_DISPATCH_CONCURRENCY=1` quando reativado.
- Configurar `LOG_LEVEL=warn` em VPS pequena, exceto em diagnóstico.

### Resultado esperado

Menos conexões, menos jobs simultâneos, menos uso de CPU/OpenAI e menor pressão no Redis/Postgres.

---

## Fase 4 — Lembretes v1.5 sem Telegram

### Objetivo

Evitar que o sistema continue criando jobs que só falham por ausência de Telegram.

### Alterações propostas

- Adicionar flag `MIKA_REMINDERS_ENABLED=false`.
- Se a flag estiver desligada:
  - `ReminderSchedulerService` não cria `Reminder`.
  - `TasksService` e `EventsService` continuam funcionando normalmente.
- Quando Web Push entrar:
  - trocar canal padrão para `WEB_PUSH`.
  - reativar `reminder-dispatch` com adapter web.

### Resultado esperado

Sem fila de lembretes inúteis, sem tentativas externas e sem logs/erros desnecessários.

---

## Fase 5 — Rotinas sem n8n

### Objetivo

Manter o Dashboard capaz de exibir último resumo, mas sem exigir n8n na v1.5.

### Alterações propostas

- `RoutinesModule` permanece para `GET /routines/latest`.
- Endpoints `POST /routines/*` continuam disponíveis para disparo manual/admin, mas não dependem de n8n.
- n8n vai para compose opcional separado.
- Futuro: se rotinas voltarem como core, usar cron interno leve no worker com flags e baixa frequência.

### Resultado esperado

Sem container n8n na VPS e sem dependência operacional de automação externa.

---

## Fase 6 — Deploy e smoke enxuto

### Objetivo

Subir a v1.5 com consumo previsível e validar o essencial.

### Ordem segura

1. Publicar imagens `api`, `web`, `worker`.
2. Subir apenas `postgres`, `redis`, `api`, `web`, `worker`.
3. Rodar migrações.
4. Rodar seed se for ambiente novo.
5. Validar:
   - `/health`
   - login web
   - Dashboard
   - Agenda
   - Projetos por prompt/arquivo
   - Chat
   - Importação de memória
6. Monitorar por 30 minutos:
   - `docker stats`
   - `docker logs --tail 100`
   - uso de RAM da VPS

### Critério de aceite

- VPS não ultrapassa 75% de RAM em idle.
- Nenhum container reiniciando em loop.
- API responde `/health`.
- Web carrega login e app.
- Redis não cresce indefinidamente.
- Worker processa `memory-index` sem iniciar lembretes Telegram.

---

## Recomendação imediata

Antes de qualquer nova feature, executar as fases 1, 3 e 4. Elas têm maior impacto no risco de travamento:

1. Compose v1.5 sem n8n/Telegram.
2. Worker por flags, com apenas `memory-index` ativo.
3. Desligar criação/despacho de lembretes Telegram.

Depois disso, executar a fase 2 para limpar o acoplamento interno da API.

---

## Decisão proposta

**A v1.5 deve operar como Web/PWA first, sem n8n e sem Telegram por padrão.**

Telegram e n8n continuam no repositório apenas como legado/opcional, ativáveis por compose/env específicos, mas não entram no deploy principal da VPS.

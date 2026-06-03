# Fechamento da v1 — Mika

**Status:** Em andamento  
**Objetivo:** Encerrar a v1 com escopo congelado, gates de qualidade (build/migrate) e UAT manual documentado, preparando o deploy do **ambiente de teste (staging)**.

---

## 1) Escopo v1 (congelado)

Base: `.specs/project/PROJECT.md`, `.specs/project/STATE.md`, `.specs/project/ROADMAP.md`.

### Inclui (v1)
- **F01**: Centralização (objetivos, tarefas, projetos, eventos, reflexões) + UI web.
- **F02**: Memória de longo prazo (pgvector + híbrida) + UI `/memories`.
- **F03/F04**: Rotinas (resumo diário + revisão semanal + check-ins).
- **F05**: Lembretes proativos (worker `reminder-dispatch`).
- **F06**: Chat inteligente (web com SSE + Telegram) com tool calling.

### Fora do escopo (v1)
- **Finanças na UI** e **finanças no chat** (tool `get_finance_goals`) — adiado v2/v3 (AD-013).
- **Insights/Estudos na UI** — ocultos/adiados (AD-014).
- Integrações externas (WhatsApp, Google Calendar, etc.), multiusuário e voz.

---

## 2) Gates aceitos para “v1 fechada”

Base: `.specs/project/CONVENTIONS.md`.

Obrigatório para fechar v1:
- **Build OK** (apps/pacotes afetados).
- **Migrate OK** (migrações aplicam sem erro em banco limpo).
- **UAT manual documentado** (checklist abaixo, com evidência mínima).

Não é gate:
- Testes unitários (`*.spec.ts`/`*.test.ts`) — fora do fluxo de entrega (AD-009).

---

## 3) Checklist UAT manual (v1)

> Sugestão de evidência mínima: data + “OK/Não OK” + 1 frase de observação por item.

### A) Setup mínimo (local)
- [ ] Subir infra (`docker compose -f docker/docker-compose.yml up -d`).
- [ ] Rodar `pnpm prisma:migrate` e `pnpm prisma:seed`.
- [ ] Subir `api`, `worker` e `web`.
- [ ] Acessar `/login` e logar com credenciais seed (README).

### B) Web — navegação e CRUD (F01)
- [ ] Sidebar: tarefas, objetivos, projetos, agenda, reflexões.
- [ ] Criar/editar/excluir pelo menos 1 item de **tarefa**.
- [ ] Criar/editar/excluir pelo menos 1 item de **evento**.
- [ ] Visualizar dashboard/visões principais sem layout quebrado.

### C) Memórias (F02)
- [ ] Abrir `/memories` e importar 1 arquivo `.md`.
- [ ] Confirmar que a busca retorna trechos relevantes.
- [ ] Confirmar que o worker `memory-index` processa sem falhas visíveis.

### D) Chat Web (F06 — SSE)
- [ ] Abrir AI Hub e enviar uma pergunta do tipo “O que preciso fazer esta semana?”.
- [ ] Ver streaming ocorrendo (tokens aparecendo progressivamente).
- [ ] Validar que a resposta usa dados reais (tarefas/eventos do banco).
- [ ] Criar tarefa via chat (“Lembre de … amanhã”) e conferir que a tarefa existe.
- [ ] Atualizar/excluir tarefa via chat e conferir o resultado.

### E) Telegram (F06 + F05)
- [ ] Vincular conta via Configurações → “Gerar código” + `/vincular CODIGO`.
- [ ] Enviar uma pergunta simples e receber resposta.
- [ ] Validar split quando resposta for longa (quando aplicável).
- [ ] Validar envio de lembrete (criar tarefa com vencimento próximo e aguardar o disparo, quando aplicável).

### F) API
- [ ] Acessar Swagger em `/docs`.
- [ ] Health básico: API respondendo e funcionalidades essenciais operantes.

---

## 4) “Pronto para staging”

Consideramos v1 pronta para subir ambiente de teste quando:
- [ ] Escopo v1 congelado e documentado (seção 1).
- [ ] Gates (build + migrate) passaram.
- [ ] Checklist UAT (seção 3) executado e registrado.

Próximo passo: seguir o runbook em `.specs/project/AMBIENTE-DE-TESTE-STAGING.md` e `docker/README-DEPLOY.md`.


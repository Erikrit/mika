# Smoke do Staging — Mika (v1)

**Objetivo:** Validar rapidamente que o ambiente de teste está operacional após deploy/migrate.  
**Gate:** obrigatório antes de iniciar UAT completo.

---

## 1) Infra e containers
- [ ] `postgres` saudável (healthcheck OK) e volume persistente criado.
- [ ] `redis` saudável e com senha aplicada.
- [ ] `api` saudável (responde HTTP).
- [ ] `web` saudável (carrega login).
- [ ] `worker` rodando (sem crash loop).

---

## 2) Rede e HTTPS
- [ ] `https://api.staging.<dominio>` responde (TLS válido).
- [ ] `https://web.staging.<dominio>` responde (TLS válido).
- [ ] Redirecionamento HTTP → HTTPS ativo.
- [ ] (Se aplicável) Proteções de staging ativas (basic auth / allowlist).

---

## 3) API (funcional mínimo)

### 3.1 Swagger
- [ ] `/docs` acessível (idealmente protegido no staging).

### 3.2 Login
- [ ] Login com usuário seed funciona (ou usuário de staging definido).

---

## 4) Web (funcional mínimo)
- [ ] `/login` carrega e autentica.
- [ ] Sidebar abre e navega (tarefas/agenda/projetos/objetivos/reflexões).
- [ ] AI Hub abre e permite enviar mensagem.

---

## 5) Chat (F06)
- [ ] Pergunta “O que preciso fazer esta semana?” retorna resposta com **dados reais**.
- [ ] Streaming (SSE) funciona (tokens aparecem progressivamente).
- [ ] “Criar tarefa via chat” cria uma tarefa real no banco.
- [ ] “Atualizar/excluir tarefa via chat” altera o dado real (sem criar tarefa “Excluir…”).

---

## 6) Worker (BullMQ)
- [ ] `memory-index` processa itens sem falhas (quando houver import/CRUD recente).
- [ ] `reminder-dispatch` não apresenta falhas (mesmo que não seja exercitado no smoke).

---

## 7) Rotinas (n8n) — fora do 1º ciclo
- [ ] (Opcional) Se n8n estiver habilitado, validar endpoints `/routines/*` com `X-Routine-Key`.


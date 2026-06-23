# Tasks — M8 Dashboard Diário + Agenda Integrada

**Status:** Done  
**Criado em:** 2026-06-16  
**UAT:** 2026-06-23 (Erik)

---

## T001 — Overview do Dashboard

### Entrega

- [x] Criar endpoint `GET /dashboard/overview`.
- [x] Retornar tarefas de hoje, eventos de hoje, tarefas atrasadas e janela semanal.
- [x] Retornar tarefas prioritárias sem prazo para foco.
- [x] Retornar resumo de projetos ativos com contagem e progresso.

### Done

- [x] Cliente web possui contrato tipado para o overview.
- [x] Build API OK.

---

## T002 — Dashboard diário

### Entrega

- [x] Redesenhar tela inicial com métricas de tarefas, agenda e atrasos.
- [x] Exibir prioridade prática combinando atrasos, tarefas de hoje e backlog prioritário.
- [x] Exibir semana com contadores de tarefas e eventos por dia.
- [x] Exibir próximos horários com eventos e prazos.
- [x] Exibir projetos ativos com progresso.
- [x] Manter leitura/resumo diário da Mika.

### Done

- [x] Dashboard passa a orientar foco diário e semanal.
- [x] UAT manual em desktop e mobile.

---

## T003 — Agenda integrada

### Entrega

- [x] Manter CRUD de eventos.
- [x] Trazer tarefas com prazo para a mesma linha do tempo.
- [x] Adicionar contadores de eventos, tarefas com prazo e total do período.
- [x] Preservar filtros de período existentes.

### Done

- [x] Agenda mostra compromissos e tarefas na mesma superfície.
- [x] UAT manual de criação/edição/exclusão de evento após integração.

---

## T004 — Validação

### Entrega

- [x] Executar verificação TypeScript sem emissão para web.
- [x] Executar verificação TypeScript sem emissão para API.
- [x] Build API/worker OK.
- [x] Registrar UAT manual.

### Nota

Build web bloqueado por EPERM no Windows (documentado no README). TypeScript web sem erros; UAT via `pnpm dev`.

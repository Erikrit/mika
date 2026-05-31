# Roadmap — Mika

**Current Milestone:** M3 — Rotinas
**Status:** Done (local)

---

## M1 — Fundação (Fase 1)

**Goal:** Usuário consegue cadastrar informações centralizadas e interagir com Mika via Telegram com IA básica.
**Target:** 4–6 semanas (part-time)
**Critério de done:** CRUD completo F01 + bot Telegram respondendo + PostgreSQL rodando em Docker + IA básica + Swagger

### Features

**F01 — Centralização de Informações** — DONE (local)

* CRUD de objetivos, tarefas, projetos, eventos, reflexões
* Metas financeiras básicas (valor alvo, prazo, status)
* Categorização por área de vida (LifeArea)
* API REST documentada + UI web mínima

**Telegram Bot (canal MVP)** — DONE (local)

* Receber mensagens e comandos básicos
* Consultar tarefas e eventos do dia
* Registrar tarefa/reflexão via chat
* Vinculação de conta via /vincular CODIGO
* Chat inteligente via OpenAI

**OpenAI Integração Básica** — DONE (local)

* Respostas conversacionais simples (gpt-4o-mini)
* Contexto limitado à sessão + dashboard (memória longa vem em M2)
* AI Hub web + Telegram unificados via ChatModule

**Infra Docker** — DONE (local dev)

* PostgreSQL + Redis + API + Web
* Runbook operacional no README
* Deploy VPS pendente (próximo milestone)

---

## M2 — Memória (Fase 2)

**Goal:** Mika lembra contextos de longo prazo e responde perguntas como "Como está meu planejamento para João Pessoa?"
**Target:** +3–4 semanas após M1

### Features

**F02 — Memória de Longo Prazo** — DONE (local)

* MemoryChunk + pgvector + full-text (tsvector)
* Worker BullMQ `memory-index` com retry 3x
* RAG híbrido no ChatModule
* API `/memory/chunks`, `/memory/search`, `/memory/import`
* UI web `/memories` com upload Markdown

---

## M3 — Rotinas (Fase 3)

**Goal:** Resumos e revisões automáticas entregues sem ação manual do usuário.
**Target:** +2–3 semanas após M2

### Features

**F03 — Resumo Diário** — DONE (local)

* Rotina manhã 07:00 via n8n
* Prioridades, compromissos, pendências, alertas
* Captura de prioridade matinal via Telegram

**F04 — Revisão Semanal** — DONE (local)

* Rotina domingo 20:00
* Concluídos, atrasados, perda de prioridade, riscos

**Rotinas Meio-dia e Noite** — DONE (local)

* Check-in meio-dia 12:30
* Reflexão noturna 21:00

---

## M4 — Proatividade

**Goal:** Mika alerta proativamente antes que o usuário esqueça.
**Target:** +2 semanas após M3

### Features

**F05 — Sistema de Lembretes** — PLANNED

* Notificações Telegram + web push (PWA)
* Lembretes de tarefas, compromissos, datas, objetivos negligenciados
* Worker BullMQ para agendamento

---

## M5 — Copiloto

**Goal:** Chat contextual completo com memória, priorização e apoio à decisão.
**Target:** +3–4 semanas após M4

### Features

**F06 — Chat Inteligente** — PLANNED

* Perguntas sobre semana, metas, finanças, mudanças
* Contexto agregado de F01 + F02 + rotinas
* Interface web + Telegram unificada
* Sugestões proativas baseadas em contexto
* Apoio à tomada de decisão

---

## M6 — Assistente Completo

**Goal:** Evoluir Mika para um segundo cérebro digital capaz de auxiliar no crescimento pessoal e profissional.

### Features

**F07 — Análise Emocional** — PLANNED

* Identificação de padrões emocionais
* Histórico emocional
* Tendências de comportamento

**F08 — Coaching de Produtividade** — PLANNED

* Sugestões de melhoria de rotina
* Identificação de gargalos
* Apoio na priorização

**F09 — Planejamento Financeiro** — PLANNED

* Evolução patrimonial
* Metas financeiras avançadas
* Simulações

**F10 — Planejamento Familiar** — PLANNED

* Organização familiar
* Eventos compartilhados
* Planejamento conjunto

---

## M7 — Android Companion

**Goal:** Disponibilizar Mika como aplicativo Android completo.

### Funcionalidades

* Login
* Dashboard
* Chat
* Memórias
* Tarefas
* Projetos
* Notificações push
* Rotinas diárias
* Reflexões
* Integração com recursos nativos Android

### Tecnologia

* React Native (preferencial)
* Flutter (avaliar)

### Critério de Sucesso

Usuário conseguir utilizar Mika integralmente sem acessar a versão web.

---

## M8 — Expansão da Memória Pessoal

**Goal:** Transformar Mika em uma memória viva da evolução do usuário ao longo dos anos.

### Features

**F11 — Expansão da Memória Pessoal** — PLANNED

#### FINANCIAL_PLAN

* Receitas
* Investimentos
* Patrimônio
* Metas financeiras
* Cenários de risco

#### PROJECTS_PORTFOLIO

* Projetos ativos
* Projetos pausados
* Projetos concluídos
* Histórico de iniciativas

#### WEEKLY_REVIEW_HISTORY

* Revisões semanais
* Aprendizados
* Decisões tomadas
* Mudanças de prioridade

### Benefícios

* Evolução histórica do usuário
* Aprendizado contínuo
* Priorização inteligente
* Planejamento de longo prazo

---

## M9 — Voz Conversacional

**Goal:** Permitir interação natural por voz.

### Funcionalidades

* Conversação contínua
* Speech-to-Text
* Text-to-Speech
* Wake Word personalizada
* Modo mãos livres

---

## M10 — Alexa / Google Home

**Goal:** Tornar Mika acessível pelos principais assistentes domésticos.

### Funcionalidades

* Skill Alexa
* Integração Google Home
* Sincronização de contexto
* Execução de comandos por voz

---

## M11 — Casa Inteligente

**Goal:** Transformar Mika no centro de automação pessoal e residencial.

### Funcionalidades

* Integração IoT
* Controle de iluminação
* Controle de climatização
* Rotinas automatizadas
* Monitoramento residencial
* Integração Home Assistant

### Resultado Esperado

Mika deixa de ser apenas uma assistente virtual e passa a atuar como um Companion Operating System completo para a vida pessoal e profissional.

---

## Future Considerations

* Integração Google Calendar
* Integração Outlook
* Integração Gmail
* Integração Notion
* WhatsApp via Evolution API
* MCP Servers
* Ollama local
* Multi-usuário
* SaaS comercial

---

## Visão Final

```text
M1 - Fundação ✅
M2 - Memória ✅
M3 - Rotinas ✅
M4 - Proatividade
M5 - Copiloto
M6 - Assistente Completo
M7 - Android Companion
M8 - Expansão da Memória Pessoal
M9 - Voz Conversacional
M10 - Alexa / Google Home
M11 - Casa Inteligente
```

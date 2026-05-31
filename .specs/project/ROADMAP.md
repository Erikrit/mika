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

- CRUD de objetivos, tarefas, projetos, eventos, reflexões
- Metas financeiras básicas (valor alvo, prazo, status)
- Categorização por área de vida (LifeArea)
- API REST documentada + UI web mínima

**Telegram Bot (canal MVP)** — DONE (local)

- Receber mensagens e comandos básicos
- Consultar tarefas e eventos do dia
- Registrar tarefa/reflexão via chat
- Vinculação de conta via /vincular CODIGO
- Chat inteligente via OpenAI

**OpenAI Integração Básica** — DONE (local)

- Respostas conversacionais simples (gpt-4o-mini)
- Contexto limitado à sessão + dashboard (memória longa vem em M2)
- AI Hub web + Telegram unificados via ChatModule

**Infra Docker** — DONE (local dev)

- PostgreSQL + Redis + API + Web
- Runbook operacional no README
- Deploy VPS pendente (próximo milestone)

---

## M2 — Memória (Fase 2)

**Goal:** Mika lembra contextos de longo prazo e responde perguntas como "Como está meu planejamento para João Pessoa?"  
**Target:** +3–4 semanas após M1

### Features

**F02 — Memória de Longo Prazo** — DONE (local)

- MemoryChunk + pgvector + full-text (tsvector)
- Worker BullMQ `memory-index` com retry 3x
- RAG híbrido no ChatModule
- API `/memory/chunks`, `/memory/search`, `/memory/import`
- UI web `/memories` com upload Markdown

---

## M3 — Rotinas (Fase 3)

**Goal:** Resumos e revisões automáticas entregues sem ação manual do usuário.  
**Target:** +2–3 semanas após M2

### Features

**F03 — Resumo Diário** — DONE (local)

- Rotina manhã 07:00 via n8n
- Prioridades, compromissos, pendências, alertas
- Captura de prioridade matinal via Telegram

**F04 — Revisão Semanal** — DONE (local)

- Rotina domingo 20:00
- Concluídos, atrasados, perda de prioridade, riscos

**Rotinas Meio-dia e Noite** — DONE (local)

- Check-in meio-dia 12:30
- Reflexão noturna 21:00

---

## M4 — Proatividade (Fase 3 cont.)

**Goal:** Mika alerta proativamente antes que o usuário esqueça.  
**Target:** +2 semanas após M3

### Features

**F05 — Sistema de Lembretes** — PLANNED

- Notificações Telegram + web push (PWA)
- Lembretes de tarefas, compromissos, datas, objetivos negligenciados
- Worker BullMQ para agendamento

---

## M5 — Copiloto (Fase 4 do roadmap original)

**Goal:** Chat contextual completo com memória, priorização e apoio à decisão.  
**Target:** +3–4 semanas após M4

### Features

**F06 — Chat Inteligente** — PLANNED

- Perguntas sobre semana, metas, finanças, mudanças
- Contexto agregado de F01 + F02 + rotinas
- Interface web + Telegram unificada

---

## M6 — Assistente Completo (Fase 5)

**Goal:** Segundo cérebro digital com coaching, emoção e planejamento avançado.

### Features

**F07 — Análise Emocional** — PLANNED  
**F08 — Coaching de Produtividade** — PLANNED  
**F09 — Planejamento Financeiro** — PLANNED  
**F10 — Planejamento Familiar** — PLANNED

---

## Future Considerations

- Integração Google Calendar (P1 externa)
- Import Notion / Markdown em lote
- WhatsApp via Evolution API
- App Capacitor/Tauri para push nativo
- Multi-usuário / SaaS comercial
- MCP servers para extensibilidade
- Modelos locais (Ollama) para reduzir custo IA

---

## Prioridade de Implementação (Fase 1)

| Ordem | Feature | Justificativa |
|-------|---------|---------------|
| 1 | Infra Docker + PostgreSQL | Base de tudo |
| 2 | F01 Centralização (API + DB) | Dados para IA consumir |
| 3 | Telegram Bot básico | Canal de uso imediato no celular |
| 4 | OpenAI integração básica | Valor percebido desde cedo |
| 5 | UI web mínima (PWA) | Visualização desktop/tablet |


# M5 - Android Companion

Status: Planejado

Objetivo:

Disponibilizar Mika como aplicativo Android.

Funcionalidades:

- Login
- Dashboard
- Chat
- Memórias
- Tarefas
- Projetos
- Notificações push
- Rotinas diárias
- Reflexões

Tecnologia:

- React Native
ou
- Flutter (avaliar)

Critério de sucesso:

Usuário conseguir utilizar Mika integralmente sem acessar versão web.
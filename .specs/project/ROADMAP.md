# Roadmap — Mika

**Current Milestone:** M8 — Repriorização V1 + Projetos Inteligentes — **Planned**  
**Status:** M6 Done (local) · MAINT-M2 Done (local) · M7 Done (implementação) · UAT M7 pendente · AD-016 aplicada

> **Direção atual:** simplificar a V1, remover dependências pouco utilizadas, fortalecer Web/PWA, Dashboard, Agenda e Projetos como centro da Mika.

---

## M1 — Fundação (Fase 1) ✅

**Goal:** Usuário consegue cadastrar informações centralizadas e interagir com Mika via Web/PWA com IA básica.

### Features

**F01 — Centralização de Informações** — DONE (local)

* CRUD de objetivos, tarefas, projetos, eventos, reflexões
* Metas financeiras básicas (valor alvo, prazo, status) — **API only**; UI adiada v2/v3
* Categorização por área de vida (LifeArea)
* API REST documentada + UI web mínima

**OpenAI Integração Básica** — DONE (local)

* Respostas conversacionais simples
* Contexto limitado à sessão + dashboard
* AI Hub web via ChatModule

**Infra Docker** — DONE (local dev)

* PostgreSQL + Redis + API + Web + Worker
* Runbook operacional no README

**Telegram Bot** — DONE, mas rebaixado para legado por AD-016

* Não é mais canal prioritário da V1
* Não deve receber novas features prioritárias
* Pode permanecer apenas por compatibilidade, desde que não consuma recursos desnecessários

---

## M2 — Memória (Fase 2) ✅

**Goal:** Mika lembra contextos de longo prazo e responde perguntas como "Como está meu planejamento para João Pessoa?"

**F02 — Memória de Longo Prazo** — DONE (local)

* MemoryChunk + pgvector + full-text
* Worker BullMQ `memory-index`
* RAG híbrido no ChatModule
* API `/memory/chunks`, `/memory/search`, `/memory/import`
* UI web `/memories` com upload Markdown

---

## M3 — Rotinas (Fase 3) ✅ / Revisar dependência n8n

**Goal:** Resumos e revisões automáticas entregues sem ação manual do usuário.

### Status atual

* Resumo diário, check-in meio-dia, reflexão noturna e revisão semanal existem.
* n8n deixa de ser requisito central por AD-016.
* Próxima revisão deve avaliar mover rotinas essenciais para backend/worker.

### Direção

* Rotinas principais devem funcionar sem Telegram.
* Entrega principal deve ser via Web/PWA e, futuramente, Web Push.
* n8n pode permanecer como automação opcional.

---

## M4 — Contexto Pessoal e Memória Humanizada ✅

**Goal:** Permitir que Mika compreenda o contexto de vida do usuário usando arquivos pessoais, memórias categorizadas e busca semântica.

**Status:** Done (UAT 2026-05-31)

### Resultado

Mika atua como companheira contextual, capaz de lembrar o que importa, respeitar limites e ajudar o usuário a se manter alinhado com sua história, objetivos e evolução.

---

## M5 — Proatividade ✅ / Repriorizar canal

**Goal:** Mika alerta proativamente antes que o usuário esqueça.

### Status atual

* Worker BullMQ `reminder-dispatch`
* Lembretes de tarefas, compromissos e objetivos negligenciados

### Mudança AD-016

* Telegram deixa de ser canal MVP.
* Web Push/PWA Notifications passa a ser prioridade futura.
* Lembretes devem ser desenhados para funcionar primeiro no app Web/PWA.

---

## M6 — Copiloto ✅

**Goal:** Chat contextual completo com memória, priorização e apoio à decisão.

### Features

* Perguntas sobre semana, metas e contexto via tool calling
* Contexto agregado de F01 + F02 + rotinas + memória humanizada
* Interface web com SSE streaming
* Criação de tarefas via chat
* Recuperação seletiva de contexto via tools/RAG

### Mudança AD-016

* O canal principal do copiloto é Web/PWA.
* Telegram fica legado/opcional.

---

## M7 — Entrada por Voz no Chat ✅

**Goal:** Permitir que o usuário fale comandos para Mika no AI Hub, convertendo voz em texto e reutilizando o fluxo atual do Chat Inteligente.

**Status:** Done

### Features

* Botão de microfone no AI Hub
* Speech-to-Text no navegador com idioma pt-BR
* Transcrição preenchendo o input atual do chat
* Envio manual após revisão do texto transcrito
* Reutilização do ChatModule, SSE streaming, histórico e tool calling existentes
* Criação de tarefas e consultas contextuais por voz

### Critério de Sucesso

* Usuário consegue criar tarefas por voz
* Usuário consegue consultar tarefas, eventos e prioridades por voz
* Funciona em navegadores compatíveis e Chrome Android
* UAT manual registrado em `.specs/features/M7-entrada-voz-chat/tasks.md`

---

## M8 — Repriorização V1 + Projetos Inteligentes

**Goal:** Ajustar a Mika para a direção correta da V1: menos integrações, mais valor real em organização pessoal.

### Features planejadas

**F12 — Simplificação de Integrações** — PLANNED

* Rebaixar Telegram para legado/opcional
* Remover dependência operacional de Telegram em novos fluxos
* Revisar n8n como opcional
* Manter Redis/Worker apenas para memória, filas e lembretes necessários
* Preparar feature flags para integrações externas

**F13 — Projetos como centro de organização** — PLANNED

* Consolidar Objetivos dentro de Projetos
* Ocultar/remover aba Objetivos da navegação principal
* Projeto passa a conter objetivos internos, marcos, tarefas, eventos, arquivos e prompts

**F14 — Projetos por prompt/arquivo** — PLANNED

* Criar projeto a partir de prompt livre
* Criar projeto a partir de arquivo enviado
* Mika sugere tarefas, eventos, marcos e cronograma
* Usuário revisa antes de salvar

**F15 — Dashboard Diário** — PLANNED

* Calendário do dia/semana
* Próximos eventos
* Tarefas de hoje
* Projetos em andamento
* Sugestão de foco da Mika

**F16 — Agenda Integrada** — PLANNED

* Calendário + tarefas na mesma tela
* Visualização diária e semanal
* Destaque para atrasadas
* Criação rápida de tarefa/evento

---

## M9 — Integrações de Organização Real

**Goal:** Conectar Mika aos sistemas que realmente apoiam agenda, tarefas e notificações.

### Prioridade

**Google Calendar** — PLANNED

* Ler eventos
* Criar eventos após confirmação
* Sincronizar com agenda interna

**Microsoft To Do** — PLANNED

* Ler tarefas
* Criar tarefas
* Relacionar tarefas externas a projetos Mika

**Web Push / PWA Notifications** — PLANNED

* Lembretes de tarefas
* Alertas de eventos
* Resumo diário no app

**Gmail** — PLANNED

* Ler e-mails relevantes com consentimento
* Extrair prazos e compromissos
* Sugerir tarefas/eventos

---

## M10 — Android Companion

**Goal:** Disponibilizar Mika em experiência mobile dedicada apenas se a PWA não for suficiente.

### Observação

Antes de criar app nativo, validar uso real da PWA no celular.

### Funcionalidades candidatas

* Login
* Dashboard
* Chat
* Memórias
* Tarefas
* Projetos
* Notificações push
* Rotinas diárias
* Reflexões

---

## M11 — Expansão da Memória Pessoal

**Goal:** Transformar Mika em uma memória viva da evolução do usuário ao longo dos anos.

### Features

* Plano financeiro histórico
* Portfólio de projetos
* Histórico de revisões semanais
* Linha do tempo de vida
* Aprendizado contínuo
* Priorização inteligente

---

## M12 — Voz Conversacional

**Goal:** Permitir interação natural por voz, indo além da transcrição pontual do M7.

### Funcionalidades

* STT backend
* Text-to-Speech
* Conversação contínua
* Wake word personalizada “Mika”
* Modo mãos livres
* Fallback para entrada por texto

---

## M13 — Alexa / Google Home

**Goal:** Tornar Mika acessível pelos principais assistentes domésticos somente após validação da experiência principal.

### Funcionalidades

* Skill Alexa
* Integração Google Home
* Sincronização de contexto
* Execução de comandos por voz

---

## M14 — Casa Inteligente

**Goal:** Transformar Mika no centro de automação pessoal e residencial em fase futura.

### Funcionalidades

* Integração IoT
* Controle de iluminação
* Controle de climatização
* Rotinas automatizadas
* Integração Home Assistant

---

## Fora do Roadmap

* Aplicativo Desktop nativo
* Electron
* Tauri
* Qualquer app desktop separado da Web/PWA

---

## Future Considerations

* **Finanças v2/v3** — Aba web, dashboard, chat `get_finance_goals`; evolução para F09
* Integração Notion
* Integração Google Drive
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
M3 - Rotinas ✅ / revisar n8n
M4 - Contexto Pessoal e Memória Humanizada ✅
M5 - Proatividade ✅ / revisar canal
M6 - Copiloto ✅
M7 - Entrada por Voz no Chat ✅
M8 - Repriorização V1 + Projetos Inteligentes
M9 - Integrações de Organização Real
M10 - Android Companion condicionado à validação da PWA
M11 - Expansão da Memória Pessoal
M12 - Voz Conversacional
M13 - Alexa / Google Home
M14 - Casa Inteligente
```

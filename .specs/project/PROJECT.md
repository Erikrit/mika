# Mika — Assistente Pessoal Inteligente

**Vision:** Copiloto pessoal com IA que reduz carga mental organizando, priorizando, recordando contextos e apoiando decisões ao longo da vida.

**For:** Erik (desenvolvedor full stack, arquiteto, múltiplas responsabilidades profissionais e familiares) — extensível a outros usuários no futuro.

**Solves:** Fragmentação de informações entre trabalho, família, finanças, saúde, viagens e projetos pessoais, consumindo energia mental em lembrar compromissos e prioridades.

---

## Direção atual da V1

A Mika V1 deve ser uma assistente pessoal Web/PWA focada em organização real do dia a dia.

Prioridades atuais:

- Dashboard diário com calendário, tarefas e foco recomendado.
- Agenda integrada com eventos e tarefas.
- Projetos como centro de planejamento.
- Criação de projetos por prompt.
- Criação de projetos por arquivo.
- Memória de longo prazo.
- Chat contextual via Web/PWA.

A V1 não deve tentar integrar com todos os sistemas externos. O foco é validar a experiência principal e reduzir consumo de recurso.

Decisão relacionada: [AD-016 — Repriorização de Integrações e Roadmap](./AD-016-repriorizacao-integracoes-e-roadmap.md).

---

## Goals

- Reduzir esquecimentos de compromissos críticos em ≥80% após 30 dias de uso contínuo.
- Entregar uma visão diária confiável com calendário, tarefas do dia e foco recomendado.
- Responder perguntas contextuais no chat em <5s (P95) com memória de longo prazo.
- Permitir criar projetos a partir de prompt ou arquivo, gerando tarefas, eventos, marcos e cronograma.
- Manter custo total (VPS + IA) abaixo de R$150/mês no uso pessoal inicial.

---

## Tech Stack

**Core:**

- Frontend: Next.js 15 (App Router, PWA)
- Backend: NestJS 11
- Language: TypeScript 5.x
- Database: PostgreSQL 16 + pgvector
- Cache/Filas: Redis 7 + BullMQ
- IA: OpenAI
- Interface principal: Web/PWA responsivo
- Infra: Docker Compose em VPS

**Integrações prioritárias futuras:**

- Google Calendar
- Microsoft To Do
- Web Push / notificações PWA
- Gmail com consentimento explícito

**Legado/opcional:**

- Telegram Bot API
- n8n

**Fora do roadmap:**

- Aplicativo Desktop nativo
- Electron
- Tauri
- Qualquer app desktop separado da Web/PWA

---

## Scope

**v1 includes:**

- Centralização de tarefas, projetos, eventos e reflexões.
- Memória de longo prazo.
- Resumo diário automático.
- Revisão semanal.
- Lembretes de tarefas e compromissos.
- Chat inteligente contextual via Web/PWA.
- Entrada por voz no chat usando Speech-to-Text do navegador.
- Dashboard diário com calendário, tarefas e foco recomendado.
- Agenda integrada com eventos e tarefas.
- Projetos por prompt/arquivo.

**v1 — compatibilidade:**

- Metas financeiras básicas no backend, sem aba web principal.
- Telegram Bot como legado/opcional, sem novas features prioritárias.
- Entidade Goal/Objetivo pode permanecer no backend, mas a aba Objetivos deve ser removida ou ocultada da navegação principal.

**v1.5 / evolução imediata:**

- Google Calendar.
- Microsoft To Do.
- Web Push / notificações PWA.
- Gmail com consentimento explícito.
- Upload de arquivos para criação de projetos e memória.

**Explicitly out of scope (v1):**

- Planejamento financeiro completo.
- Planejamento familiar multi-usuário.
- WhatsApp, Outlook, Google Drive e integrações extensas.
- App nativo iOS/Android antes de validar PWA mobile.
- Aplicativo Desktop nativo.
- Multi-tenant / SaaS comercial.
- Sincronização offline completa.

---

## Produto: Projetos como centro

A aba **Projetos** deve concentrar planejamento, objetivos, tarefas, eventos e arquivos.

Estrutura conceitual:

```text
Projeto
├── Objetivos internos
├── Marcos
├── Tarefas
├── Eventos
├── Lembretes
└── Arquivos / prompts de origem
```

A aba **Objetivos** deve ser removida ou ocultada da navegação principal, pois a função se sobrepõe a Projetos.

---

## Projeto por prompt ou arquivo

A Mika deve permitir que o usuário crie um projeto informando um prompt livre ou enviando um arquivo.

A IA deve analisar o conteúdo e sugerir:

- título;
- descrição;
- objetivos internos;
- marcos;
- tarefas;
- eventos;
- lembretes;
- cronograma inicial.

O usuário deve revisar antes de salvar.

---

## Constraints

- Evolução incremental part-time.
- Single VPS inicial, Docker Compose, self-hosted.
- 1 desenvolvedor, orçamento IA controlado.
- Dados pessoais sensíveis com preferência por infraestrutura própria.
- Web/PWA responsivo para navegador, notebook, tablet e celular.
- Evitar integrações que não sejam usadas diariamente.

---

## Visão de Longo Prazo

A Mika deve evoluir como um Companion Operating System pessoal.

Evolução prevista:

1. Web/PWA, memória, rotinas, dashboard, agenda e projetos inteligentes.
2. Integrações com Google Calendar, Microsoft To Do, notificações PWA e Gmail.
3. Android apenas se a PWA não atender bem ao uso mobile.
4. Voz conversacional completa.
5. Alexa / Google Home.
6. Casa inteligente e automações futuras.

Objetivo final:

Transformar Mika em um sistema operacional pessoal focado em organização, memória, produtividade e tomada de decisões.

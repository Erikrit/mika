# Mika — Assistente Pessoal Inteligente

**Vision:** Copiloto pessoal com IA que reduz carga mental organizando, priorizando, recordando contextos e apoiando decisões ao longo da vida.
**For:** Erik (desenvolvedor full stack, arquiteto, múltiplas responsabilidades profissionais e familiares) — extensível a outros usuários no futuro.
**Solves:** Fragmentação de informações entre trabalho, família, finanças, saúde, viagens e projetos pessoais, consumindo energia mental em lembrar compromissos e prioridades.

## Goals

- Reduzir esquecimentos de compromissos críticos em ≥80% após 30 dias de uso contínuo
- Entregar resumo diário automático às 07:00 com ≥95% de confiabilidade
- Responder perguntas contextuais no chat em <5s (P95) com memória de longo prazo
- Manter custo total (VPS + IA) abaixo de R$150/mês no uso pessoal inicial
- Construir base técnica escalável para evolução até assistente completo (Fase 5)

## Tech Stack

**Core:**

- Framework Frontend: Next.js 15 (App Router, PWA)
- Framework Backend: NestJS 11
- Language: TypeScript 5.x
- Database: PostgreSQL 16 + pgvector
- Cache/Filas: Redis 7 + BullMQ
- IA: OpenAI (GPT-4o-mini rotinas, GPT-4o decisões complexas)
- Automação: n8n (rotinas manhã/meio-dia/noite)
- Mensageria MVP: Telegram Bot API
- Infra: Docker Compose em VPS (Hetzner/Contabo)

**Key dependencies:**

- Prisma ORM (schema + migrations)
- Zod (validação compartilhada)
- LangChain ou Vercel AI SDK (orquestração IA)
- node-telegram-bot-api ou grammY (Telegram)
- Pino (logs estruturados)

**Monorepo:**

```
apps/web      → Next.js PWA
apps/api      → NestJS REST + WebSocket
apps/worker   → Jobs (embeddings, resumos, lembretes)
packages/shared → Types, schemas Zod, constants
packages/ai   → Prompts, RAG utilities
```

**Convenções de desenvolvimento:** [.specs/project/CONVENTIONS.md](./CONVENTIONS.md) — pt-BR em UI/docs; testes unitários fora do escopo de entrega.

## Scope

**v1 includes (MVP — F01 a F06):**

- F01: Centralização de objetivos, tarefas, projetos, eventos e reflexões (UI web em expansão — MAINT-M2)
- F02: Memória de longo prazo com categorias (Profissional, Financeiro, Familiar, Saúde, Viagens)
- F03: Resumo diário automático (prioridades, compromissos, pendências, alertas)
- F04: Revisão semanal (concluídos, atrasados, perda de prioridade, riscos)
- F05: Lembretes (tarefas, compromissos, datas, objetivos negligenciados)
- F06: Chat inteligente contextual via web e Telegram

**v1.5 / evolução imediata:**

- F11A: Entrada por voz no chat utilizando Speech-to-Text do navegador, mantendo o fluxo atual do ChatModule e das tools

**v1 — backend only (UI adiada v2/v3):**

- Metas financeiras básicas (`FinanceGoalsModule` + API REST) — sem aba web nem tool de chat por enquanto (AD-013)

**Explicitly out of scope (v1):**

- F07 Análise emocional e padrões de humor
- F08 Coaching avançado de produtividade
- F09 Planejamento financeiro completo (receitas, gastos, investimentos) — **UI v2/v3**; API básica de metas já existe
- F10 Planejamento familiar multi-usuário
- Integrações WhatsApp, Outlook, Google Drive, Gmail
- App nativo iOS/Android (PWA responsivo primeiro)
- Multi-tenant / SaaS comercial
- Sincronização offline completa (leitura offline é Fase 2+)

## Constraints

- **Timeline:** Fase 1 em 4–6 semanas (part-time)
- **Technical:** Single VPS inicial (4GB RAM), Docker Compose, self-hosted
- **Resources:** 1 desenvolvedor (Erik), orçamento IA controlado
- **Privacy:** Dados pessoais sensíveis — preferência por infraestrutura própria (LGPD-ready)
- **Portabilidade:** Web responsivo (desktop, tablet, celular) + Telegram como canal mobile

## Visão de Longo Prazo

O Mika não será apenas um chatbot.

A visão final é construir um Companion Operating System capaz de acompanhar o usuário em qualquer dispositivo.

Evolução prevista:

Fase 1 (Atual)
- Web
- Telegram
- Memória persistente
- Rotinas inteligentes

Fase 2
- Aplicativo Android
- Operação local e online
- Notificações nativas
- Widgets inteligentes

Fase 2.5
- Entrada por voz no chat
- Speech-to-Text no navegador
- Captura rápida de tarefas e compromissos
- Integração com fluxo existente do copiloto

Fase 3
- Assistente por voz completo
- STT backend
- Text-to-Speech
- Wake word personalizada
- Conversas contínuas
- Modo mãos livres

Fase 4
- Integração Alexa

Fase 5
- Integração Google Home

Fase 6
- Casa inteligente
- Automações domésticas
- Controle de dispositivos IoT

Objetivo final:

Transformar Mika em um sistema operacional pessoal focado em organização, memória, produtividade e tomada de decisões.

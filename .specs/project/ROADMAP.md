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

## M4 — Contexto Pessoal e Memória Humanizada

**Goal:** Permitir que Mika compreenda o contexto de vida do usuário, usando arquivos pessoais importados, memórias categorizadas e busca semântica sob demanda para gerar interações mais humanas, úteis e alinhadas aos objetivos reais.
**Target:** +2–3 semanas após M3

### Princípio Técnico

A Mika não deve colocar todo o conteúdo pessoal diretamente no prompt fixo. O contexto deve ser recuperado sob demanda por RAG/memória semântica, buscando apenas os trechos relevantes para cada conversa, rotina ou sugestão.

### Features

**F05 — Importação de Documentos Pessoais** — PLANNED

* Criar local dedicado para importar arquivos como `Objetivos de Vida.md`, `Como Trabalhar Com Erik.md`, planejamentos, reflexões e mapas mentais
* Suportar upload/importação de Markdown, texto e documentos convertidos para texto
* Categorizar documentos por área: vida, trabalho, finanças, rotina, projetos e relacionamentos
* Gerar chunks semânticos com metadados de origem, data, categoria, nível de privacidade e prioridade

**F06 — Classificação de Memória em 3 Camadas** — PLANNED

#### Memória Fixa

* Quem é o usuário
* Estilo de comunicação preferido
* Objetivos principais
* Valores, preferências e limites
* Forma ideal da Mika interagir com o usuário

#### Memória Evolutiva

* Conquistas
* Mudanças de planos
* Decisões recentes
* Aprendizados
* Projetos iniciados, pausados ou concluídos
* Histórico de evolução pessoal e profissional

#### Memória Sensível

* Informações pessoais que exigem maior cuidado
* Dados financeiros
* Dados familiares ou de relacionamento
* Reflexões pessoais privadas
* Conteúdos que precisam de consentimento e controle de acesso

**F07 — Recuperação Contextual Segura** — PLANNED

* Buscar apenas o contexto necessário para a conversa atual
* Priorizar memórias fixas para personalização básica
* Usar memórias evolutivas para acompanhamento de progresso
* Usar memórias sensíveis somente quando forem relevantes e permitidas
* Evitar expor informações privadas sem necessidade
* Registrar quando uma memória sensível foi usada em uma resposta ou sugestão

**F08 — Interações Humanizadas e Companheiras** — PLANNED

* Fazer sugestões com base na história, objetivos, desafios e vitórias do usuário
* Ajudar o usuário a não esquecer objetivos importantes
* Alertar quando houver desalinhamento entre rotina atual e planejamento de vida
* Relembrar conquistas e progresso quando fizer sentido
* Adaptar tom, intensidade e estilo de cobrança conforme o perfil do usuário
* Diferenciar apoio, lembrete, alerta e sugestão estratégica

**F09 — Gestão de Consentimento e Privacidade** — PLANNED

* Permitir marcar memórias como públicas, privadas ou sensíveis
* Permitir desativar uso de determinada memória em respostas
* Permitir apagar, editar ou arquivar memórias importadas
* Criar camada de proteção para memórias financeiras e pessoais
* Evitar usar memórias sensíveis em integrações externas sem autorização explícita

### Critério de Done

* Usuário consegue importar documentos pessoais em uma área dedicada
* Mika indexa e classifica documentos em memória fixa, evolutiva e sensível
* Chat consegue recuperar contexto relevante sem carregar tudo no prompt fixo
* Mika consegue responder e sugerir ações considerando objetivos de vida e histórico pessoal
* Memórias sensíveis possuem controle explícito de uso, edição e exclusão

### Resultado Esperado

Mika deixa de ser apenas uma assistente com memória técnica e passa a atuar como uma companheira contextual, capaz de lembrar o que importa, respeitar limites e ajudar o usuário a se manter alinhado com sua própria história, objetivos e evolução.

---

## M5 — Proatividade

**Goal:** Mika alerta proativamente antes que o usuário esqueça.
**Target:** +2 semanas após M4

### Features

**F10 — Sistema de Lembretes** — PLANNED

* Notificações Telegram + web push (PWA)
* Lembretes de tarefas, compromissos, datas, objetivos negligenciados
* Worker BullMQ para agendamento
* Alertas baseados em contexto pessoal e objetivos importantes

---

## M6 — Copiloto

**Goal:** Chat contextual completo com memória, priorização e apoio à decisão.
**Target:** +3–4 semanas após M5

### Features

**F11 — Chat Inteligente** — PLANNED

* Perguntas sobre semana, metas, finanças, mudanças
* Contexto agregado de F01 + F02 + rotinas + memória humanizada
* Interface web + Telegram unificada
* Sugestões proativas baseadas em contexto
* Apoio à tomada de decisão
* Recuperação seletiva de contexto via RAG/memória semântica

---

## M7 — Assistente Completo

**Goal:** Evoluir Mika para um segundo cérebro digital capaz de auxiliar no crescimento pessoal e profissional.

### Features

**F12 — Análise Emocional** — PLANNED

* Identificação de padrões emocionais
* Histórico emocional
* Tendências de comportamento
* Uso cuidadoso de memórias sensíveis

**F13 — Coaching de Produtividade** — PLANNED

* Sugestões de melhoria de rotina
* Identificação de gargalos
* Apoio na priorização
* Acompanhamento de evolução com base na memória evolutiva

**F14 — Planejamento Financeiro** — PLANNED

* Evolução patrimonial
* Metas financeiras avançadas
* Simulações
* Cenários de risco
* Proteção reforçada para dados financeiros sensíveis

**F15 — Planejamento Familiar** — PLANNED

* Organização familiar
* Eventos compartilhados
* Planejamento conjunto

---

## M8 — Android Companion

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

## M9 — Expansão da Memória Pessoal

**Goal:** Transformar Mika em uma memória viva da evolução do usuário ao longo dos anos.

### Features

**F16 — Expansão da Memória Pessoal** — PLANNED

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

#### LIFE_STORY_TIMELINE

* Marcos importantes da vida
* Vitórias pessoais
* Momentos difíceis superados
* Mudanças de fase
* Decisões que moldaram o planejamento atual

### Benefícios

* Evolução histórica do usuário
* Aprendizado contínuo
* Priorização inteligente
* Planejamento de longo prazo
* Interações mais humanas e conectadas com a história do usuário

---

## M10 — Voz Conversacional

**Goal:** Permitir interação natural por voz.

### Funcionalidades

* Conversação contínua
* Speech-to-Text
* Text-to-Speech
* Wake Word personalizada
* Modo mãos livres

---

## M11 — Alexa / Google Home

**Goal:** Tornar Mika acessível pelos principais assistentes domésticos.

### Funcionalidades

* Skill Alexa
* Integração Google Home
* Sincronização de contexto
* Execução de comandos por voz

---

## M12 — Casa Inteligente

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
M4 - Contexto Pessoal e Memória Humanizada
M5 - Proatividade
M6 - Copiloto
M7 - Assistente Completo
M8 - Android Companion
M9 - Expansão da Memória Pessoal
M10 - Voz Conversacional
M11 - Alexa / Google Home
M12 - Casa Inteligente
```

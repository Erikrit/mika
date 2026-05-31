# SPECIFICATION DOCUMENT

# Projeto: Mika (Assistente Pessoal Inteligente)

Versão: 1.0  
Status: Planejamento Inicial  
Autor: Erik Barcelos

---

# 1. VISÃO DO PRODUTO

## Objetivo

Criar um assistente pessoal baseado em IA capaz de:

- Organizar atividades.
- Gerenciar prioridades.
- Auxiliar na tomada de decisão.
- Reduzir carga mental.
- Acompanhar objetivos de vida.
- Auxiliar no planejamento de curto, médio e longo prazo.
- Atuar como memória externa.

O sistema deverá funcionar como um "copiloto pessoal" e não apenas como um gerenciador de tarefas.

---

# 2. PROBLEMA A SER RESOLVIDO

Atualmente o usuário precisa gerenciar simultaneamente:

- Múltiplos trabalhos.
- Relacionamento.
- Mudança de cidade.
- Planejamento financeiro.
- Cuidados familiares.
- Estudos e atualização profissional.
- Saúde física.
- Terapia e autoconhecimento.
- Viagens.
- Projetos futuros.

Grande parte da energia mental é consumida lembrando compromissos, contextos e prioridades.

---

# 3. OBJETIVOS DE NEGÓCIO

## Objetivos Primários

- Reduzir carga cognitiva.
- Melhorar organização.
- Melhorar execução.
- Diminuir esquecimentos.
- Melhorar percepção de prioridades.

## Objetivos Secundários

- Aprender IA aplicada.
- Construir portfólio.
- Criar produto potencialmente comercializável.

---

# 4. PERSONA PRINCIPAL

Nome: Erik

Perfil:

- Desenvolvedor Full Stack.
- Arquiteto de Software.
- Perfil analítico.
- Alta responsabilidade familiar.
- Múltiplos empregos.
- Interesse em IA.
- Busca equilíbrio entre produtividade e qualidade de vida.

---

# 5. FUNCIONALIDADES MVP

## F01 - Centralização de Informações

Permitir registrar:

- Objetivos.
- Tarefas.
- Projetos.
- Eventos.
- Reflexões.
- Metas financeiras.

---

## F02 - Memória de Longo Prazo

A IA deverá lembrar:

- Projetos ativos.
- Objetivos atuais.
- Eventos futuros.
- Contextos importantes.

Exemplo: "Como está meu planejamento para João Pessoa?"

---

## F03 - Resumo Diário

Todos os dias gerar:

- Prioridades do dia.
- Compromissos.
- Pendências.
- Alertas.

---

## F04 - Revisão Semanal

Gerar automaticamente:

- O que foi concluído.
- O que está atrasado.
- O que perdeu prioridade.
- Novos riscos.

---

## F05 - Sistema de Lembretes

Notificar:

- Tarefas.
- Compromissos.
- Datas importantes.
- Objetivos negligenciados.

---

## F06 - Chat Inteligente

Permitir perguntas como:

- O que preciso fazer esta semana?
- Estou atrasado em alguma meta?
- Como está minha situação financeira?
- O que ainda falta para a mudança?

---

# 6. FUNCIONALIDADES FUTURAS

## F07 - Análise Emocional

Registro de humor diário. Identificação de padrões emocionais.

## F08 - Coaching de Produtividade

Sugestões automáticas. Detecção de sobrecarga. Identificação de prioridades conflitantes.

## F09 - Planejamento Financeiro

Controle de receitas, gastos, investimentos e metas.

## F10 - Planejamento Familiar

Acompanhamento de família, avó, relacionamento e datas importantes.

---

# 7. FONTES DE DADOS

## Internas

Banco de Dados, Notion, Arquivos Markdown, Documentos PDF, Planilhas.

## Externas

Google Calendar, Microsoft Outlook, Telegram, WhatsApp, Gmail, Google Drive.

---

# 8. ARQUITETURA SUGERIDA

- **Frontend:** Next.js
- **Backend:** NestJS
- **Banco:** PostgreSQL + pgvector
- **IA:** OpenAI
- **Automação:** n8n
- **Mensageria:** Telegram Bot
- **Infraestrutura:** Docker
- **Hospedagem:** VPS própria

---

# 9. MÓDULO DE MEMÓRIA

Categorias: Profissional, Financeiro, Familiar, Saúde, Viagens.

---

# 10. ROTINAS AUTOMÁTICAS

- **Manhã:** Resumo diário + "Qual sua prioridade principal hoje?"
- **Meio-dia:** Verificação rápida + "Está conseguindo avançar?"
- **Noite:** Reflexão + conclusões, pendências, nível de energia

---

# 11. MÉTRICAS DE SUCESSO

Redução de esquecimentos, cumprimento de metas, redução da sensação de sobrecarga, maior clareza de prioridades, maior consistência na execução.

---

# 12. ROADMAP

- **FASE 1:** Banco de dados, cadastro de tarefas, integração Telegram, OpenAI
- **FASE 2:** Memória de longo prazo, vetorização, busca contextual
- **FASE 3:** Revisões automáticas, planejamento semanal
- **FASE 4:** Análise emocional, planejamento financeiro
- **FASE 5:** Assistente pessoal completo

---

# VISÃO FINAL

O projeto não deve funcionar como uma simples ToDo List. A missão é se tornar um segundo cérebro digital capaz de organizar, priorizar, recordar, alertar e apoiar decisões.

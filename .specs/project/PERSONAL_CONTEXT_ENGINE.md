# PERSONAL_CONTEXT_ENGINE.md

## Objetivo

O Personal Context Engine (PCE) é o componente responsável por transformar a Mika de uma assistente baseada apenas em dados e tarefas em uma companheira digital contextual.

O sistema deve permitir que Mika compreenda quem é o usuário, sua história, objetivos, evolução ao longo do tempo e contexto atual, utilizando recuperação semântica sob demanda ao invés de carregar todas as informações diretamente no prompt.

---

# Princípios Fundamentais

## P1 — Memória não é Prompt

A Mika nunca deve carregar toda a memória do usuário em contexto.

Toda recuperação deve ocorrer através de:

* Busca vetorial
* Busca semântica
* Busca híbrida (vector + full text)
* Regras de relevância

Objetivo:

* Reduzir custo
* Melhorar performance
* Evitar poluição de contexto
* Melhorar precisão das respostas

---

## P2 — Memória é Contextual

Nem toda memória é relevante para toda conversa.

Exemplo:

Pergunta:

"Qual tarefa devo priorizar hoje?"

Não precisa recuperar:

* Planejamento financeiro
* Histórico de relacionamentos
* Reflexões pessoais antigas

Apenas:

* Objetivos atuais
* Prioridades recentes
* Projetos ativos

---

## P3 — Privacidade por Padrão

Toda memória possui classificação de privacidade.

Categorias:

PUBLIC
PRIVATE
SENSITIVE

Informações sensíveis exigem regras adicionais de acesso e uso.

---

# Arquitetura

## Camada 1 — Memória Fixa

Representa quem o usuário é.

Mudança rara.

Exemplos:

* Nome
* Perfil profissional
* Valores
* Objetivos de longo prazo
* Preferências de comunicação
* Como Mika deve interagir

### Exemplos de documentos

Objetivos de Vida.md

Como Trabalhar Com Erik.md

Perfil Pessoal.md

Visão de Futuro.md

---

## Camada 2 — Memória Evolutiva

Representa a evolução do usuário.

Atualizada constantemente.

Exemplos:

* Conquistas
* Mudanças de objetivos
* Projetos concluídos
* Aprendizados
* Decisões importantes

### Exemplos

Revisões Semanais

Projetos

Planejamentos

Mapas Mentais

Histórico de Estudos

---

## Camada 3 — Memória Sensível

Informações privadas.

Necessitam proteção adicional.

Exemplos:

* Finanças
* Saúde
* Relacionamentos
* Reflexões pessoais privadas

A recuperação deve possuir score mínimo mais alto.

---

# Estrutura de Armazenamento

## ContextDocument

```json
{
  "id": "uuid",
  "title": "Objetivos de Vida",
  "category": "LIFE",
  "memoryType": "FIXED",
  "privacyLevel": "PRIVATE",
  "source": "markdown",
  "createdAt": "2026-01-01",
  "updatedAt": "2026-01-01"
}
```

## ContextChunk

```json
{
  "documentId": "uuid",
  "content": "...",
  "embedding": [],
  "tags": [],
  "importance": 1,
  "privacyLevel": "PRIVATE"
}
```

---

# Categorias

LIFE

WORK

FINANCE

PROJECT

ROUTINE

LEARNING

RELATIONSHIP

HEALTH

EMOTIONAL

MEMORY

CUSTOM

---

# Importação de Arquivos

## Formatos

Markdown

TXT

PDF convertido

DOCX convertido

JSON

---

# Pipeline de Importação

Upload

↓

Parser

↓

Chunking

↓

Classificação

↓

Embeddings

↓

Indexação

↓

Disponível para RAG

---

# Estratégia de Chunking

Chunk ideal:

500 a 1200 caracteres

Sobreposição:

10% a 15%

Objetivo:

Preservar contexto sem gerar excesso de tokens.

---

# Recuperação Semântica

## Fluxo

Mensagem do usuário

↓

Análise de intenção

↓

Determinar categorias relevantes

↓

Buscar chunks

↓

Ranquear resultados

↓

Enviar contexto para LLM

---

# Score de Relevância

## Fórmula Base

Relevance Score =

SemanticSimilarity +
ImportanceWeight +
RecencyWeight +
CategoryWeight

---

## Pesos

Semântica: 60%

Importância: 20%

Recência: 10%

Categoria: 10%

---

# Sistema de Importância

Cada memória recebe score:

1 = Normal

2 = Importante

3 = Muito importante

4 = Crítica

5 = Essencial para identidade

Exemplo:

Objetivos de Vida

Importância 5

---

# Sistema de Evolução

A Mika deve criar registros automáticos de evolução.

Exemplo:

Evento:

Projeto concluído

Registro:

Conquista adicionada à memória evolutiva

---

# Sugestões Humanizadas

A Mika pode utilizar contexto para:

* lembrar objetivos
* sugerir prioridades
* identificar desalinhamentos
* reconhecer progresso
* reforçar consistência

Nunca utilizar abordagem manipulativa.

---

# Guardrails

A Mika não deve:

* pressionar emocionalmente
* gerar culpa
* tomar decisões pelo usuário
* expor memórias privadas sem necessidade

Ela deve:

* orientar
* lembrar
* contextualizar
* apoiar

---

# Futuras Integrações

Google Calendar

Outlook

Notion

Telegram

WhatsApp

Home Assistant

Alexa

Google Home

---

# Resultado Esperado

A Mika deve funcionar como uma memória viva do usuário.

Ela não substitui decisões humanas.

Ela amplia memória, contexto, organização e clareza para que o usuário consiga evoluir ao longo dos anos sem perder informações importantes sobre sua própria trajetória.

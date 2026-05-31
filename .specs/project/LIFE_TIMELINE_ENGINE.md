# LIFE_TIMELINE_ENGINE.md

## Objetivo

O Life Timeline Engine é o componente responsável por organizar a evolução do usuário em uma linha do tempo viva, permitindo que a Mika compreenda não apenas dados isolados, mas a trajetória, fases, decisões, conquistas e mudanças importantes ao longo dos anos.

Esse mecanismo complementa o Personal Context Engine ao transformar memórias, revisões, projetos, decisões e eventos em uma narrativa cronológica pesquisável.

---

## Por que existe

Sem uma linha do tempo, a Mika pode lembrar informações, mas terá dificuldade para entender evolução.

Com a Timeline, a Mika poderá responder perguntas como:

* O que mudou na minha vida nos últimos anos?
* Quais foram minhas maiores conquistas?
* Quando comecei determinado projeto?
* Quais decisões moldaram meu planejamento atual?
* Quais metas foram abandonadas, concluídas ou alteradas?

---

## Princípios

### T1 — Memória precisa de tempo

Toda memória relevante deve, sempre que possível, ter uma referência temporal.

Essa referência pode ser:

* Data exata
* Mês e ano
* Ano
* Período aproximado
* Relação com outro evento

---

### T2 — Nem tudo vira marco histórico

A Timeline não deve registrar qualquer informação simples.

Devem virar eventos apenas conteúdos com valor histórico, estratégico ou evolutivo.

Exemplos:

* Início ou conclusão de projeto
* Mudança de objetivo
* Decisão importante
* Conquista
* Aprendizado relevante
* Mudança de rotina
* Mudança profissional
* Registro financeiro relevante
* Revisão semanal consolidada

---

### T3 — A linha do tempo deve ser consultável

A Timeline não é apenas visual. Ela precisa ser usada pela IA para recuperar contexto histórico.

---

## Entidade Principal

### TimelineEvent

```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Início do projeto Mika",
  "description": "Usuário iniciou o projeto Mika como assistente pessoal com memória, rotinas e integração futura com dispositivos.",
  "eventType": "PROJECT_STARTED",
  "lifeArea": "PROJECT",
  "datePrecision": "MONTH",
  "eventDate": "2026-05-01",
  "sourceType": "USER_UPLOAD",
  "sourceDocumentId": "uuid",
  "relatedProjectIds": [],
  "relatedGoalIds": [],
  "importance": 5,
  "privacyLevel": "PRIVATE",
  "confidence": 0.95,
  "createdAt": "2026-05-31T00:00:00Z",
  "updatedAt": "2026-05-31T00:00:00Z"
}
```

---

## Tipos de Evento

```text
GOAL_CREATED
GOAL_UPDATED
GOAL_COMPLETED
GOAL_PAUSED
PROJECT_STARTED
PROJECT_PAUSED
PROJECT_COMPLETED
DECISION_MADE
MILESTONE_REACHED
LESSON_LEARNED
ROUTINE_CHANGED
FINANCIAL_EVENT
CAREER_EVENT
STUDY_EVENT
PERSONAL_EVENT
WEEKLY_REVIEW_SUMMARY
MONTHLY_REVIEW_SUMMARY
YEARLY_REVIEW_SUMMARY
CUSTOM
```

---

## Precisão Temporal

Nem toda memória terá data exata.

```text
EXACT_DATE
MONTH
YEAR
APPROXIMATE
UNKNOWN
```

Exemplo:

```json
{
  "title": "Mudança de foco para independência financeira",
  "datePrecision": "MONTH",
  "eventDate": "2026-05-01"
}
```

---

## Fontes de Eventos

Eventos podem surgir de:

* Documentos importados
* Revisões semanais
* Reflexões diárias
* Projetos
* Metas
* Tarefas concluídas importantes
* Conversas com Mika
* Dados financeiros
* Calendário
* Decisões registradas manualmente

---

## Pipeline de Criação

```text
Entrada de informação
↓
Análise de relevância histórica
↓
Classificação do tipo de evento
↓
Extração de data ou período
↓
Vinculação com objetivos/projetos/memórias
↓
Cálculo de importância
↓
Validação de privacidade
↓
Registro na Timeline
```

---

## Critério para virar Evento

Um conteúdo deve virar evento quando atender pelo menos um dos critérios:

* Afeta um objetivo de longo prazo
* Representa uma conquista
* Representa uma decisão relevante
* Muda uma prioridade
* Marca início, pausa ou fim de projeto
* Resume um período importante
* Explica uma mudança de comportamento ou direção

---

## Relação com Personal Context Engine

O Personal Context Engine armazena e recupera memórias.

O Life Timeline Engine organiza a evolução dessas memórias ao longo do tempo.

Exemplo:

```text
ContextDocument: Objetivos de Vida.md
↓
ContextChunk: desejo de reduzir carga de trabalho
↓
TimelineEvent: decisão de planejar independência financeira
```

---

## Relação com Knowledge Graph

A Timeline deve conectar eventos a entidades do grafo:

* Objetivos
* Projetos
* Decisões
* Pessoas
* Áreas da vida
* Documentos
* Revisões

Exemplo:

```text
Independência Financeira
  └── Decisão: reduzir dependência de múltiplos trabalhos
      └── Projeto relacionado: Plano financeiro
          └── Evento: criação do planejamento financeiro
```

---

## Consultas esperadas

A Mika deve conseguir responder:

* O que aconteceu de importante este mês?
* Quais foram minhas principais decisões neste ano?
* O que mudou nos meus objetivos desde o início do projeto?
* Quais projetos avancei nos últimos 90 dias?
* Quais áreas da vida estão sem evolução recente?
* Quais conquistas posso comemorar?

---

## Agrupamentos

A Timeline deve permitir agrupamentos por:

* Ano
* Mês
* Área da vida
* Projeto
* Objetivo
* Tipo de evento
* Importância
* Privacidade

---

## Resumos Periódicos

A Mika deve ser capaz de gerar:

* Resumo semanal
* Resumo mensal
* Resumo trimestral
* Resumo anual

Esses resumos também podem virar eventos consolidados.

---

## Guardrails

A Mika não deve:

* Transformar qualquer conversa casual em marco histórico
* Criar eventos sensíveis sem controle de privacidade
* Tratar inferências como fatos confirmados
* Expor eventos privados sem necessidade

A Mika deve:

* Diferenciar fato, inferência e hipótese
* Permitir edição e exclusão de eventos
* Pedir confirmação quando o evento for importante e derivado de inferência
* Preservar o histórico sem sobrecarregar o usuário

---

## Critério de Done

* Eventos importantes podem ser registrados manualmente
* Eventos podem ser criados a partir de documentos e revisões
* Cada evento possui data, tipo, importância e privacidade
* Eventos podem ser vinculados a objetivos, projetos e documentos
* Mika consegue consultar a Timeline para responder perguntas históricas
* Usuário consegue editar, excluir ou arquivar eventos

---

## Resultado Esperado

A Mika deixa de apenas lembrar informações soltas e passa a compreender a trajetória do usuário.

Esse motor permite que a assistente acompanhe evolução, reconheça conquistas, identifique mudanças de direção e ajude o usuário a não perder a própria história ao longo dos anos.

# KNOWLEDGE_GRAPH_ENGINE.md

## Objetivo

Transformar informações isoladas em uma rede de conhecimento conectada.

O Knowledge Graph Engine permite que a Mika compreenda relações entre objetivos, projetos, decisões, memórias, eventos, áreas da vida e documentos.

Sem ele, a Mika responde usando busca.

Com ele, a Mika consegue raciocinar sobre conexões.

---

## Entidades Principais

* Goal
* Project
* Task
* Decision
* TimelineEvent
* ContextDocument
* Person
* LifeArea
* Memory

---

## Relações

```text
RELATES_TO
SUPPORTS
BLOCKS
CAUSED_BY
RESULTED_IN
BELONGS_TO
DEPENDS_ON
INSPIRED_BY
```

---

## Exemplo

Independência Financeira
→ SUPPORTED_BY → Investimentos
→ SUPPORTED_BY → Projeto Mika
→ SUPPORTED_BY → Assados Barcelos

---

## Benefícios

* Respostas mais inteligentes
* Identificação de dependências
* Sugestões contextualizadas
* Descoberta de conflitos entre objetivos
* Planejamento de longo prazo

---

## Critério de Done

* Entidades podem ser conectadas
* Relações podem ser criadas automaticamente e manualmente
* Mika consegue navegar pelas relações durante consultas
* Integração com Timeline Engine e Personal Context Engine

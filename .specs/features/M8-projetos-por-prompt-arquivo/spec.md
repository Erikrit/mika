# Spec — M8 Projetos por Prompt/Arquivo

**Status:** Draft
**Milestone:** M8 — Repriorização V1 + Projetos Inteligentes
**Criado em:** 2026-06-16

---

## Contexto

Após a AD-016, a Mika V1 passa a priorizar a experiência Web/PWA de organização pessoal. Projetos deixam de ser apenas uma lista simples e passam a ser o centro de planejamento: objetivos internos, marcos, tarefas, eventos, lembretes, arquivos e prompts devem convergir para a aba Projetos.

Hoje o módulo de Projetos já possui CRUD básico, associação com área de vida e tarefas vinculadas. A próxima evolução é permitir que Mika transforme um texto livre ou um arquivo em um plano executável, sempre com revisão humana antes de salvar.

---

## Objetivo

Permitir que o usuário crie um projeto inteligente a partir de:

- prompt livre;
- arquivo enviado;
- combinação de prompt + arquivo.

A Mika deve analisar o material de entrada e sugerir um plano inicial composto por projeto, objetivos internos, marcos, tarefas, eventos e lembretes.

---

## Escopo V1

### Inclui

- Entrada por prompt na tela de Projetos.
- Upload de arquivo para criação de projeto.
- Análise via OpenAI usando contexto mínimo e instruções em pt-BR.
- Geração de rascunho estruturado antes de persistir dados.
- Tela de revisão onde o usuário pode aceitar, editar ou remover itens sugeridos.
- Criação do projeto e tarefas aprovadas.
- Associação automática à área de vida quando possível, com opção de ajuste manual.
- Registro do prompt/arquivo de origem como contexto/memória do projeto quando aplicável.

### Não inclui

- Sincronização com Google Calendar ou Microsoft To Do.
- Criação automática sem confirmação do usuário.
- Parser avançado de todos os formatos de arquivo.
- Workflow multiusuário.
- Conversão completa da entidade `Goal` para novo modelo relacional.
- Geração de eventos recorrentes complexos.

---

## Requisitos Funcionais

### PROJECT-AI-01 — Criar projeto por prompt

**Dado** que o usuário está na aba Projetos  
**Quando** informar um texto livre descrevendo um objetivo ou plano  
**Então** a Mika deve gerar um rascunho de projeto com título, descrição, área sugerida, prioridade e datas estimadas quando houver indício no texto.

### PROJECT-AI-02 — Criar projeto por arquivo

**Dado** que o usuário envia um arquivo suportado  
**Quando** solicitar análise  
**Então** a Mika deve extrair o conteúdo relevante e gerar um rascunho de projeto revisável.

### PROJECT-AI-03 — Sugerir tarefas

**Dado** um rascunho gerado  
**Quando** o conteúdo contiver ações, pendências ou etapas  
**Então** a Mika deve sugerir tarefas com título, descrição opcional, prioridade, prazo opcional e associação ao projeto.

### PROJECT-AI-04 — Sugerir marcos/objetivos internos

**Dado** um plano com etapas relevantes  
**Quando** houver agrupamentos naturais ou resultados esperados  
**Então** a Mika deve sugerir marcos ou objetivos internos em formato revisável.

### PROJECT-AI-05 — Sugerir eventos e lembretes simples

**Dado** que o texto ou arquivo contenha datas e horários claros  
**Quando** a Mika gerar o rascunho  
**Então** deve sugerir eventos e lembretes simples, sem salvar nada antes da confirmação.

### PROJECT-AI-06 — Revisão antes de salvar

**Dado** que um rascunho foi gerado  
**Quando** o usuário revisar os itens  
**Então** ele deve poder editar, remover ou aceitar cada item antes da criação final.

### PROJECT-AI-07 — Persistência incremental

**Dado** que o usuário aprovou o rascunho  
**Quando** confirmar a criação  
**Então** o sistema deve criar primeiro o projeto e depois os itens filhos aprovados, mantendo associação entre eles.

### PROJECT-AI-08 — Falha graciosa

**Dado** que a IA, upload ou parser falhe  
**Quando** o usuário solicitar a geração  
**Então** a Mika deve mostrar uma mensagem clara e preservar o texto/arquivo para nova tentativa sempre que possível.

---

## Requisitos Não Funcionais

- Todas as mensagens visíveis devem estar em pt-BR.
- A geração deve evitar gravação automática de dados sensíveis sem revisão.
- A resposta da IA deve seguir contrato estruturado validado no backend.
- O fluxo deve funcionar na Web/PWA desktop e mobile.
- O custo deve ser controlado com limite de tamanho de arquivo e truncamento explícito.
- O MVP deve priorizar confiabilidade sobre automação completa.

---

## Formatos de Arquivo

### MVP

- `.txt`
- `.md`

### Próxima evolução

- `.pdf`
- `.docx`
- `.csv`

Arquivos não suportados devem exibir mensagem clara e não devem ser enviados para análise.

---

## Contrato de Rascunho

O backend deve retornar um objeto estruturado semelhante a:

```json
{
  "project": {
    "title": "Mudança para João Pessoa",
    "description": "Plano para organizar a mudança familiar em novembro.",
    "lifeAreaSlug": "personal",
    "priority": 2,
    "startDate": "2026-06-20",
    "targetDate": "2026-11-01",
    "tags": ["mudanca", "familia"]
  },
  "milestones": [
    {
      "title": "Documentação resolvida",
      "description": "Separar e atualizar documentos necessários."
    }
  ],
  "tasks": [
    {
      "title": "Listar móveis que serão levados",
      "description": "Separar por cômodo e estado de conservação.",
      "priority": 2,
      "dueAt": "2026-07-01"
    }
  ],
  "events": [
    {
      "title": "Visita técnica da internet",
      "startsAt": "2026-10-20T14:00:00.000Z",
      "endsAt": "2026-10-20T15:00:00.000Z"
    }
  ],
  "warnings": [
    "Algumas datas foram inferidas a partir do texto."
  ]
}
```

---

## Critérios de Aceite

- Usuário consegue abrir Projetos e escolher criar manualmente ou com Mika.
- Prompt livre gera rascunho estruturado.
- Arquivo `.md` ou `.txt` gera rascunho estruturado.
- Usuário revisa antes de salvar.
- Projeto aprovado é persistido.
- Tarefas aprovadas são persistidas associadas ao projeto.
- Itens rejeitados não são persistidos.
- Erros de IA/upload/parser são exibidos sem quebrar a tela.
- Build web e API passam.

---

## Riscos

- Modelo gerar excesso de tarefas ou tarefas vagas.
- Datas inferidas incorretamente.
- Upload de arquivo grande aumentar custo e latência.
- Schema atual ainda não possui entidade própria para marcos/objetivos internos de projeto.
- Eventos ainda não têm relação direta com `Project`.

---

## Decisões de MVP

- Marcos/objetivos internos podem começar como campos do rascunho e não necessariamente como entidade persistida.
- Eventos podem ser sugeridos no rascunho, mas a persistência pode ser adiada se exigir alteração de schema.
- O primeiro incremento deve salvar projeto + tarefas, pois o schema atual já suporta essa associação.
- Objetivos globais (`Goal`) permanecem por compatibilidade, mas não devem ser promovidos na navegação principal.

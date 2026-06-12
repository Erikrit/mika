# AD-016 — Repriorização de Integrações e Roadmap da Mika

**Data:** 2026-06-12  
**Status:** Aprovada  
**Tipo:** Decisão de Produto e Arquitetura

---

## Contexto

A Mika chegou a uma fase em que existem várias integrações e módulos planejados ou implementados: n8n, Redis, worker, Telegram, chat, rotinas, memória, projetos, tarefas e agenda.

Como o projeto ainda está na V1, a prioridade agora é reduzir complexidade, economizar recursos da VPS e focar no que realmente valida a proposta principal: uma assistente pessoal inteligente para organizar vida, projetos, tarefas, agenda e decisões.

---

## Decisão

A Mika V1 deve deixar de priorizar integrações pouco utilizadas ou prematuras.

### Removido da prioridade

1. **Telegram**
   - Era um canal antigo do sistema.
   - Hoje quase não é utilizado.
   - Não deve ser tratado como canal principal da V1.
   - Deve ficar como legado/opcional, sem novas features dependentes dele.

2. **Aplicativo Desktop**
   - Não será planejado como produto separado.
   - A estratégia continua sendo Web/PWA responsivo para notebook, navegador e celular.
   - Desktop nativo, Tauri, Electron ou equivalente ficam fora do roadmap.

---

## Direção do Produto

A Mika deve ser posicionada como um **sistema operacional pessoal de organização**, não como uma plataforma genérica de automação.

Prioridade atual:

1. Dashboard diário com calendário e tarefas do dia.
2. Agenda com eventos e tarefas integradas.
3. Projetos como centro de planejamento.
4. Criação de projetos por prompt.
5. Criação de projetos por arquivo.
6. Integrações futuras com sistemas reais de agenda, tarefas e notificações.

---

## Mudança na navegação

### Remover ou ocultar aba Objetivos

A aba **Objetivos** tem sobreposição funcional com **Projetos**.

A decisão é consolidar objetivos dentro de projetos.

Nova estrutura conceitual:

```text
Projeto
├── Objetivos internos
├── Marcos
├── Tarefas
├── Eventos
├── Lembretes
└── Arquivos / prompts de origem
```

A entidade `Goal` pode permanecer no backend por compatibilidade, mas a UX principal deve concentrar tudo em Projetos.

---

## Nova experiência de Projetos

A aba **Projetos** deve permitir:

1. Criar projeto manualmente.
2. Criar projeto a partir de um prompt.
3. Criar projeto a partir de arquivo enviado.
4. A Mika analisar o conteúdo e sugerir:
   - título do projeto;
   - descrição;
   - objetivos internos;
   - marcos;
   - tarefas;
   - eventos;
   - lembretes;
   - cronograma inicial.

Exemplo de uso:

> Quero me mudar para João Pessoa em novembro. Preciso organizar móveis, documentação, viagem, internet, escola e adaptação familiar.

A Mika deve transformar isso em um plano executável.

---

## Nova prioridade de integrações

| Prioridade | Integração | Decisão |
|---|---|---|
| P0 | Web/PWA | Canal principal |
| P0 | OpenAI | Manter |
| P0 | PostgreSQL + pgvector | Manter |
| P0 | Redis + BullMQ | Manter apenas para memória, filas e lembretes necessários |
| P1 | Google Calendar | Planejar para V1.5 |
| P1 | Microsoft To Do | Planejar para V1.5 |
| P1 | Web Push / notificações PWA | Planejar para substituir Telegram como canal de lembretes |
| P2 | Gmail | Planejar com consentimento explícito |
| P2 | Upload de arquivos | Priorizar para criação de projetos e memória |
| P3 | n8n | Opcional, não central |
| Legado | Telegram | Não priorizar novas features |
| Fora | Aplicativo Desktop | Removido do roadmap |

---

## Tela inicial

A tela inicial deve priorizar uma visão diária simples:

```text
Bom dia, Erik

Calendário de hoje / semana
Próximos eventos
Tarefas de hoje
Projetos em andamento
Sugestão da Mika para foco do dia
```

A ideia é que o usuário consiga abrir a Mika e entender rapidamente:

- o que tem hoje;
- o que está atrasado;
- qual projeto precisa de atenção;
- o que a Mika recomenda priorizar.

---

## Tela de Agenda

A tela de Agenda deve combinar calendário e tarefas.

Requisitos de UX:

1. Visualização diária e semanal.
2. Eventos com horário.
3. Tarefas do dia ao lado ou abaixo do calendário.
4. Destaque para atrasadas.
5. Botão rápido para criar tarefa/evento.
6. Futuro: sincronização com Google Calendar e Microsoft To Do.

---

## Impacto na arquitetura

1. Telegram deixa de ser dependência central.
2. n8n deixa de ser requisito para fluxo principal.
3. Worker e Redis continuam, mas apenas para funções realmente necessárias.
4. Integrações externas devem ser ativáveis por feature flag.
5. A documentação futura deve tratar Web/PWA como canal principal.
6. App Desktop nativo não deve ser incluído em milestones.

---

## Próximas tasks sugeridas

- [ ] Atualizar `ROADMAP.md` removendo Desktop e rebaixando Telegram para legado.
- [ ] Atualizar `PROJECT.md` para consolidar Projetos como centro da organização.
- [ ] Atualizar `INTEGRATIONS.md` com nova matriz de prioridades.
- [ ] Atualizar `ARCHITECTURE.md` removendo Telegram do diagrama principal.
- [ ] Atualizar dashboard para exibir calendário + tarefas do dia.
- [ ] Atualizar agenda para exibir tarefas e eventos em visão integrada.
- [ ] Ocultar/remover aba Objetivos da navegação principal.
- [ ] Criar spec para “Projetos por prompt/arquivo”.

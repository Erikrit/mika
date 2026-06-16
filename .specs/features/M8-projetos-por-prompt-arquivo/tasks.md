# Tasks — M8 Projetos por Prompt/Arquivo

**Status:** In Progress
**Criado em:** 2026-06-16

---

## T001 — Preparar contratos compartilhados

### Entrega

- [x] Criar schema de entrada para geração de rascunho.
- [x] Criar schema de rascunho retornado pela IA.
- [x] Criar schema de confirmação do rascunho.
- [x] Exportar tipos em `@mika/shared`.

### Done

- [x] Backend e frontend usam os mesmos tipos.

---

## T002 — Criar serviço de geração de rascunho

### Entrega

- [x] Criar `ProjectDraftAiService`.
- [x] Montar prompt estruturado em pt-BR.
- [x] Chamar OpenAI com resposta JSON.
- [x] Validar resposta com Zod.
- [x] Tratar falhas com mensagem amigável.

### Done

- [ ] `POST /projects/draft` retorna rascunho válido para prompt simples.

**Nota:** implementação adicionada; validação manual pendente.

---

## T003 — Criar endpoint de rascunho

### Entrega

- [x] Adicionar `POST /projects/draft`.
- [x] Aceitar prompt livre.
- [x] Aceitar conteúdo de arquivo `.md`/`.txt`.
- [x] Limitar tamanho da entrada.

### Done

- [ ] Swagger exibe o endpoint.
- [x] Erros de arquivo/formato são claros.

---

## T004 — Persistir rascunho aprovado

### Entrega

- [x] Adicionar `POST /projects/from-draft`.
- [x] Criar projeto aprovado.
- [x] Criar tarefas aprovadas com `projectId`.
- [x] Ignorar itens rejeitados.
- [x] Invalidar/indexar memória pelos fluxos existentes.

### Done

- [ ] Projeto e tarefas aparecem na UI após confirmação.

**Nota:** fluxo implementado; UAT pendente.

---

## T005 — UI de criação com Mika

### Entrega

- [x] Adicionar botão "Criar com Mika" na tela Projetos.
- [x] Criar modal/painel com prompt livre.
- [x] Adicionar upload `.md`/`.txt`.
- [x] Exibir loading e erros.

### Done

- [ ] Usuário consegue gerar rascunho sem sair da tela Projetos.

---

## T006 — UI de revisão

### Entrega

- [x] Exibir dados do projeto sugerido.
- [x] Permitir editar campos principais.
- [x] Exibir tarefas sugeridas.
- [x] Permitir editar/remover tarefas.
- [x] Exibir marcos/eventos como sugestões quando ainda não persistidos.
- [x] Confirmar criação.

### Done

- [ ] Nenhum item é salvo antes do clique de confirmação.

---

## T007 — Ocultar Objetivos da navegação principal

### Entrega

- [x] Remover ou ocultar `/goals` da sidebar.
- [x] Manter rota `/goals` funcional ou redirecionada por compatibilidade.
- [x] Garantir que Projetos seja a superfície principal de planejamento.

### Done

- [x] Sidebar não mostra mais a aba Objetivos.

---

## T008 — Validação manual

### Cenários

- [ ] Criar rascunho por prompt curto.
- [ ] Criar rascunho por prompt longo.
- [ ] Criar rascunho por arquivo `.md`.
- [ ] Criar rascunho por arquivo `.txt`.
- [ ] Editar título antes de salvar.
- [ ] Remover tarefa sugerida antes de salvar.
- [ ] Confirmar e verificar projeto criado.
- [ ] Confirmar e verificar tarefas associadas.
- [ ] Testar erro de formato não suportado.
- [ ] Testar mobile.

### Done

- [ ] Build web OK.
- [ ] Build API OK.
- [ ] UAT manual registrado.

**Nota:** build/UAT não executados nesta rodada por decisão do usuário.

---

## T009 — Documentação e estado

### Entrega

- [x] Atualizar `STATE.md`.
- [x] Atualizar `ROADMAP.md` se houver mudança de status.
- [ ] Atualizar README se o fluxo entrar em uso.

### Done

- [x] Documentação reflete o estado real da implementação.

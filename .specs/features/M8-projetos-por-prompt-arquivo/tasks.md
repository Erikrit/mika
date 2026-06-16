# Tasks — M8 Projetos por Prompt/Arquivo

**Status:** Draft
**Criado em:** 2026-06-16

---

## T001 — Preparar contratos compartilhados

### Entrega

- [ ] Criar schema de entrada para geração de rascunho.
- [ ] Criar schema de rascunho retornado pela IA.
- [ ] Criar schema de confirmação do rascunho.
- [ ] Exportar tipos em `@mika/shared`.

### Done

- [ ] Backend e frontend usam os mesmos tipos.

---

## T002 — Criar serviço de geração de rascunho

### Entrega

- [ ] Criar `ProjectDraftAiService`.
- [ ] Montar prompt estruturado em pt-BR.
- [ ] Chamar OpenAI com resposta JSON.
- [ ] Validar resposta com Zod.
- [ ] Tratar falhas com mensagem amigável.

### Done

- [ ] `POST /projects/draft` retorna rascunho válido para prompt simples.

---

## T003 — Criar endpoint de rascunho

### Entrega

- [ ] Adicionar `POST /projects/draft`.
- [ ] Aceitar prompt livre.
- [ ] Aceitar conteúdo de arquivo `.md`/`.txt`.
- [ ] Limitar tamanho da entrada.

### Done

- [ ] Swagger exibe o endpoint.
- [ ] Erros de arquivo/formato são claros.

---

## T004 — Persistir rascunho aprovado

### Entrega

- [ ] Adicionar `POST /projects/from-draft`.
- [ ] Criar projeto aprovado.
- [ ] Criar tarefas aprovadas com `projectId`.
- [ ] Ignorar itens rejeitados.
- [ ] Invalidar/indexar memória pelos fluxos existentes.

### Done

- [ ] Projeto e tarefas aparecem na UI após confirmação.

---

## T005 — UI de criação com Mika

### Entrega

- [ ] Adicionar botão "Criar com Mika" na tela Projetos.
- [ ] Criar modal/painel com prompt livre.
- [ ] Adicionar upload `.md`/`.txt`.
- [ ] Exibir loading e erros.

### Done

- [ ] Usuário consegue gerar rascunho sem sair da tela Projetos.

---

## T006 — UI de revisão

### Entrega

- [ ] Exibir dados do projeto sugerido.
- [ ] Permitir editar campos principais.
- [ ] Exibir tarefas sugeridas.
- [ ] Permitir editar/remover tarefas.
- [ ] Exibir marcos/eventos como sugestões quando ainda não persistidos.
- [ ] Confirmar criação.

### Done

- [ ] Nenhum item é salvo antes do clique de confirmação.

---

## T007 — Ocultar Objetivos da navegação principal

### Entrega

- [ ] Remover ou ocultar `/goals` da sidebar.
- [ ] Manter rota `/goals` funcional ou redirecionada por compatibilidade.
- [ ] Garantir que Projetos seja a superfície principal de planejamento.

### Done

- [ ] Sidebar não mostra mais a aba Objetivos.

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

---

## T009 — Documentação e estado

### Entrega

- [ ] Atualizar `STATE.md`.
- [ ] Atualizar `ROADMAP.md` se houver mudança de status.
- [ ] Atualizar README se o fluxo entrar em uso.

### Done

- [ ] Documentação reflete o estado real da implementação.

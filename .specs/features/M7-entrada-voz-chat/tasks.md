# Tasks — M7 Entrada por Voz no Chat

## Objetivo

Adicionar captura de voz ao AI Hub reutilizando o fluxo atual do Chat Inteligente.

---

## T001 — Criar hook de reconhecimento de voz

### Entrega

- [ ] Criar hook `useSpeechRecognition`
- [ ] Detectar suporte do navegador
- [ ] Expor estado de escuta
- [ ] Expor transcrição
- [ ] Expor erros

### Done

- [ ] Hook reutilizável criado
- [ ] Compatível com TypeScript

---

## T002 — Adicionar botão de microfone

### Entrega

- [ ] Adicionar botão ao lado do botão de enviar
- [ ] Seguir identidade visual do projeto
- [ ] Responsivo desktop/mobile

### Done

- [ ] Botão aparece no AI Hub

---

## T003 — Estados visuais

### Entrega

- [ ] Estado idle
- [ ] Estado ouvindo
- [ ] Estado processando
- [ ] Estado erro

### Done

- [ ] Usuário entende claramente quando o microfone está ativo

---

## T004 — Integração com input existente

### Entrega

- [ ] Preencher textarea automaticamente
- [ ] Permitir edição antes do envio
- [ ] Não alterar fluxo de envio existente

### Done

- [ ] Mensagem transcrita aparece corretamente no campo

---

## T005 — Compatibilidade

### Entrega

- [ ] Chrome Desktop
- [ ] Edge Desktop
- [ ] Chrome Android

### Done

- [ ] Funciona nos navegadores alvo do MVP

---

## T006 — Tratamento de erros

### Entrega

- [ ] Permissão negada
- [ ] Navegador incompatível
- [ ] Falha de reconhecimento

### Done

- [ ] Mensagens amigáveis em pt-BR

---

## T007 — Atualização de documentação

### Entrega

- [ ] Atualizar ROADMAP
- [ ] Atualizar PROJECT
- [ ] Atualizar STATE

### Done

- [ ] Documentação sincronizada

---

## T008 — UAT Manual

### Cenários

- [ ] Criar tarefa por voz
- [ ] Consultar tarefas por voz
- [ ] Consultar prioridades por voz
- [ ] Consultar memória contextual por voz
- [ ] Validar fluxo em desktop
- [ ] Validar fluxo em Android

### Resultado esperado

- [ ] Sem regressão no Chat Inteligente
- [ ] Fluxo atual de tool calling preservado

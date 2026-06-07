# Tasks — M7 Entrada por Voz no Chat

## Objetivo

Adicionar captura de voz ao AI Hub reutilizando o fluxo atual do Chat Inteligente.

---

## T001 — Criar hook de reconhecimento de voz

### Entrega

- [x] Criar hook `useSpeechRecognition`
- [x] Detectar suporte do navegador
- [x] Expor estado de escuta
- [x] Expor transcrição
- [x] Expor erros

### Done

- [x] Hook reutilizável criado (`apps/web/src/hooks/use-speech-recognition.ts`)
- [x] Compatível com TypeScript (`apps/web/src/types/speech-recognition.d.ts`)

**Rastreabilidade:** VOICE-CHAT-01, VOICE-CHAT-04

---

## T002 — Adicionar botão de microfone

### Entrega

- [x] Adicionar botão ao lado do botão de enviar
- [x] Seguir identidade visual do projeto
- [x] Responsivo desktop/mobile

### Done

- [x] Botão aparece no AI Hub (`ai-hub.tsx`)

**Rastreabilidade:** VOICE-CHAT-01, VOICE-CHAT-03

---

## T003 — Estados visuais

### Entrega

- [x] Estado idle
- [x] Estado ouvindo
- [x] Estado processando
- [x] Estado erro

### Done

- [x] Usuário entende claramente quando o microfone está ativo

**Rastreabilidade:** VOICE-CHAT-03

---

## T004 — Integração com input existente

### Entrega

- [x] Preencher input automaticamente
- [x] Permitir edição antes do envio
- [x] Não alterar fluxo de envio existente

### Done

- [x] Mensagem transcrita aparece corretamente no campo

**Rastreabilidade:** VOICE-CHAT-01, VOICE-CHAT-02, VOICE-CHAT-05 (envio manual)

---

## T005 — Compatibilidade

### Entrega

- [ ] Chrome Desktop
- [ ] Edge Desktop
- [ ] Chrome Android

### Done

- [ ] Funciona nos navegadores alvo do MVP

**Nota:** Implementação pronta; validação multi-navegador depende do UAT (T008).

---

## T006 — Tratamento de erros

### Entrega

- [x] Permissão negada
- [x] Navegador incompatível
- [x] Falha de reconhecimento

### Done

- [x] Mensagens amigáveis em pt-BR (`getSpeechRecognitionErrorMessage`)

**Rastreabilidade:** VOICE-CHAT-04

---

## T007 — Atualização de documentação

### Entrega

- [x] Atualizar ROADMAP
- [x] Atualizar STATE
- [ ] Atualizar PROJECT (sem alteração necessária — M7 não muda visão)

### Done

- [x] Documentação sincronizada

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

### Registro UAT

| # | Cenário | Navegador | Data | Resultado | Observações |
|---|---------|-----------|------|-----------|-------------|
| 1 | Criar tarefa por voz | | | | |
| 2 | Consultar tarefas | | | | |
| 3 | Prioridades | | | | |
| 4 | Memória contextual | | | | |
| 5 | Toggle escuta | | | | |
| 6 | Permissão negada | | | | |
| 7 | Navegador incompatível | | | | |
| 8 | Regressão chat | | | | |
| 9 | Mobile Sheet | | | | |

**Gate de implementação (2026-06-07):** compilação Next.js OK + tipos OK. UAT funcional pendente — executar em **localhost** (Chrome Desktop) e Chrome Android. Staging HTTP puro pode falhar (Web Speech API exige contexto seguro).

**Pré-requisitos UAT:**

- Microfone disponível e permissão concedida
- Chrome Desktop / Edge Desktop / Chrome Android
- `pnpm dev` ou build local com HTTPS

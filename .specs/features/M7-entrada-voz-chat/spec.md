# M7 — Entrada por Voz no Chat

## Problem Statement

Hoje o usuário precisa digitar todas as mensagens para Mika.

Isso reduz a velocidade de captura de tarefas, ideias e compromissos, principalmente em dispositivos móveis ou em momentos em que o usuário está sem foco para escrever.

A Mika já possui Chat Inteligente com tool calling, memória contextual, streaming na web e integração com Telegram. A entrada por voz deve aproveitar esse fluxo existente, convertendo fala em texto e enviando o comando para o chat atual.

## Goals

- Permitir que o usuário dite comandos para Mika no AI Hub.
- Adicionar botão de microfone ao lado do botão de enviar mensagem.
- Converter fala em texto em português brasileiro.
- Preencher o campo de mensagem com o texto transcrito.
- Reutilizar 100% do fluxo atual do ChatModule e das tools existentes.
- Permitir criação de tarefas, eventos e consultas contextuais por voz, sem alterar regras de negócio no backend.

## Non-Goals / Out of Scope

| Feature | Motivo |
|---------|--------|
| Wake word personalizada | Fica para Voz Conversacional completa |
| Conversação contínua | Requer arquitetura própria de sessão de áudio |
| Text-to-Speech | Fica para etapa futura com resposta falada |
| Modo mãos livres | Depende de wake word + TTS + escuta contínua |
| STT backend | MVP usa Speech-to-Text do navegador |
| App nativo | PWA responsivo primeiro |

---

## User Stories

### P1 — Criar tarefa por voz ⭐ MVP

**User Story:** Como usuário, quero falar uma tarefa para Mika para registrá-la sem precisar digitar.

**Exemplo de fala:**

> Mika criar atividade para amanhã com prioridade 1 com o título revisar planejamento às 9 horas.

**Acceptance Criteria:**

1. WHEN usuário clicar no botão de microfone THEN sistema SHALL solicitar permissão de microfone quando necessário.
2. WHEN usuário começar a falar THEN sistema SHALL exibir estado visual de escuta.
3. WHEN navegador reconhecer fala THEN sistema SHALL transcrever em pt-BR.
4. WHEN transcrição terminar THEN sistema SHALL preencher o campo de mensagem do AI Hub.
5. WHEN usuário enviar a mensagem THEN fluxo atual do chat SHALL processar o comando normalmente.
6. WHEN ChatModule identificar criação de tarefa THEN tool atual `create_task` SHALL ser usada sem mudança de contrato.

**Independent Test:**

Falar: “Mika criar atividade para amanhã às nove horas com prioridade 1 chamada revisar planejamento”.

Resultado esperado: texto aparece no campo do chat; ao enviar, Mika cria a tarefa usando o fluxo atual.

---

### P1 — Consultar contexto por voz

**User Story:** Como usuário, quero perguntar por voz sobre minhas tarefas, eventos e prioridades para obter resposta rápida sem navegar pelas telas.

**Acceptance Criteria:**

1. WHEN usuário falar “O que preciso fazer amanhã?” THEN texto SHALL ser transcrito para o input.
2. WHEN usuário enviar THEN ChatModule SHALL consultar tasks/events/memory conforme comportamento atual.
3. WHEN resposta for gerada THEN UI SHALL continuar usando streaming existente.

**Independent Test:**

Falar: “Mika, o que eu preciso fazer amanhã?” → enviar → resposta usa dados reais do banco.

---

### P2 — Envio automático após transcrição

**User Story:** Como usuário avançado, quero poder falar e enviar automaticamente para reduzir ainda mais o atrito.

**Acceptance Criteria:**

1. Configuração inicial SHALL manter envio manual para evitar ações acidentais.
2. Envio automático MAY ser adicionado depois com preferência explícita do usuário.
3. Comandos destrutivos ou sensíveis SHALL exigir confirmação visual antes de execução.

**Status:** Deferred dentro da própria feature.

---

## Edge Cases

- WHEN navegador não suportar Speech Recognition THEN exibir mensagem: “Reconhecimento de voz não disponível neste navegador.”
- WHEN usuário negar permissão de microfone THEN exibir orientação curta para liberar permissão.
- WHEN fala não for compreendida THEN manter input intacto e permitir nova tentativa.
- WHEN usuário clicar novamente durante escuta THEN parar captura.
- WHEN transcrição parcial estiver disponível THEN mostrar feedback sem enviar automaticamente.
- WHEN ambiente estiver barulhento THEN permitir edição manual do texto antes do envio.

---

## Requirement Traceability

| Requirement ID | Story | Prioridade | Status |
|----------------|-------|------------|--------|
| VOICE-CHAT-01 | Criar tarefa por voz | P1 | Implemented |
| VOICE-CHAT-02 | Consultar contexto por voz | P1 | Implemented |
| VOICE-CHAT-03 | Estados visuais de microfone | P1 | Implemented |
| VOICE-CHAT-04 | Tratamento de navegador incompatível | P1 | Implemented |
| VOICE-CHAT-05 | Envio automático opcional | P2 | Deferred |

---

## Success Criteria

- [ ] Usuário consegue criar tarefa por voz no AI Hub. *(UAT pendente)*
- [ ] Usuário consegue consultar tarefas/eventos por voz. *(UAT pendente)*
- [x] O fluxo atual de tool calling permanece inalterado.
- [ ] Funciona em Chrome desktop, Edge desktop e Chrome Android. *(UAT pendente)*
- [x] Mensagens e estados visíveis estão em pt-BR.
- [ ] UAT manual registrado em `tasks.md`.

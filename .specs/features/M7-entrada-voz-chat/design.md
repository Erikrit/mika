# Design — M7 Entrada por Voz no Chat

## Visão Geral

A entrada por voz será uma camada de UX sobre o chat existente.

O navegador converte voz em texto. O texto transcrito entra no mesmo campo usado hoje pelo AI Hub. O envio continua chamando o fluxo atual do ChatModule, mantendo tool calling, RAG, histórico e streaming sem mudanças de contrato.

```text
Usuário
  ↓ fala
Botão Microfone no AI Hub
  ↓
Web Speech API / SpeechRecognition
  ↓
Texto transcrito em pt-BR
  ↓
Input atual do chat
  ↓
POST /chat/message/stream
  ↓
ChatModule + tools existentes
```

---

## Arquitetura

### Frontend

- Criar hook `useSpeechRecognition` em `apps/web`.
- Integrar o hook ao componente de input do AI Hub.
- Adicionar botão visual de microfone ao lado do botão de enviar.
- Usar estados explícitos para feedback ao usuário.

### Backend

Nenhuma alteração obrigatória nesta fase.

A transcrição ocorre no navegador e o backend recebe texto comum, igual ao fluxo atual.

### IA / Tools

Nenhuma alteração obrigatória nesta fase.

As tools atuais continuam responsáveis por interpretar e executar comandos, por exemplo:

- `get_tasks`
- `get_events`
- `search_memory`
- `create_task`
- `update_task`
- `delete_task`

---

## Decisão Técnica

### MVP: Speech-to-Text no navegador

Usar Web Speech API quando disponível.

**Motivos:**

- Entrega rápida de valor.
- Sem custo adicional de IA.
- Sem upload de áudio pessoal para backend.
- Menor impacto em infraestrutura.
- Bom encaixe com PWA responsivo.

### Futuro: Voz Conversacional completa

A etapa futura deverá avaliar:

- STT backend com OpenAI Whisper ou alternativa local.
- TTS para resposta falada.
- Sessão de áudio contínua.
- Wake word “Mika”.
- Modo mãos livres.
- Estratégia de privacidade para áudio.

---

## Componentes

```text
AIHubInput
 ├── Textarea / input atual
 ├── Botão de microfone
 ├── Botão enviar
 └── Feedback de estado

useSpeechRecognition
 ├── isSupported
 ├── isListening
 ├── transcript
 ├── error
 ├── startListening()
 ├── stopListening()
 └── resetTranscript()
```

---

## Estados de UI

| Estado | Descrição | Feedback sugerido |
|--------|-----------|-------------------|
| Idle | Microfone parado | Ícone de microfone normal |
| Listening | Capturando fala | Ícone ativo/pulsando + texto “Ouvindo...” |
| Processing | Finalizando transcrição | Texto “Processando áudio...” |
| Error | Erro de permissão/suporte | Toast ou texto curto em pt-BR |
| Unsupported | Navegador incompatível | Botão desabilitado com tooltip |

---

## UX Esperada

1. Usuário vê botão de microfone ao lado do botão de enviar.
2. Usuário clica no microfone.
3. Sistema solicita permissão se necessário.
4. Botão muda para estado “Ouvindo...”.
5. Usuário fala o comando.
6. Sistema transcreve para o campo de mensagem.
7. Usuário revisa/edita se quiser.
8. Usuário envia normalmente.
9. Mika responde pelo fluxo atual.

---

## Segurança e Privacidade

- O MVP não deve persistir áudio.
- O MVP não deve enviar áudio para o backend.
- Apenas o texto transcrito será enviado, igual a uma mensagem digitada.
- A UI deve deixar claro quando o microfone está ouvindo.
- A captura deve iniciar somente por ação explícita do usuário.

---

## Compatibilidade

### Alvo do MVP

- Chrome Desktop
- Edge Desktop
- Chrome Android

### Limitações conhecidas

- Safari/iOS pode ter suporte limitado ou comportamento inconsistente.
- Firefox pode não suportar a API nativamente.
- Reconhecimento depende de permissões e configurações do navegador.

---

## Estratégia de Implementação

### Onda A — Hook

Criar abstração isolada para reconhecimento de voz.

### Onda B — UI

Adicionar botão de microfone no AI Hub sem alterar o fluxo de envio.

### Onda C — Integração

Quando a transcrição finalizar, preencher o input existente.

### Onda D — UAT

Validar comandos reais:

- Criar tarefa.
- Criar evento/compromisso se a tool existir.
- Consultar prioridades.
- Consultar contexto de memória.

---

## Critérios de Done Técnico

- Build do app web passa.
- Nenhum teste unitário novo é obrigatório.
- Strings visíveis estão em pt-BR.
- Sem alteração obrigatória em API/worker/database.
- UAT manual registrado no checklist de tasks.

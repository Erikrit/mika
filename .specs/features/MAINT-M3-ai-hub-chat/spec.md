# MAINT-M3 — Correções AI Hub / Chat web

**Status:** Implementado (2026-05-31)  
**Gate:** `pnpm build` + UAT manual (sem jest)

## Problema

Três defeitos na tela do chat (AI Hub):

1. **Scroll** — mensagens longas ou muitas trocas não rolam; conteúdo cortado.
2. **Histórico** — ao fechar/reabrir o chat ou recarregar a página, a conversa sumia.
3. **Insight estático** — texto fake "78% de progresso semanal" sem dados reais.

## Solução

| Aspecto | Implementação |
|---------|---------------|
| Scroll | `min-h-0 overflow-hidden` em `AiHubContent`; `ScrollArea` com `min-h-0 flex-1`; `SheetContent` com `flex h-full flex-col` |
| Histórico | `GET /chat/sessions`, `GET /chat/sessions/:id/messages`; `ChatContext` + `localStorage` hint `mika_web_chat_session_id` |
| Estado compartilhado | `ChatProvider` no `Providers` — desktop e mobile usam o mesmo estado |
| Sessões | Últimas 3 (canal WEB); chips + botão "Nova conversa" |
| Insight | Copy neutra: "Tudo em dia! Pergunte o que precisa." |

## Decisões

| ID | Decisão |
|----|---------|
| AD-M3-01 | Persistência via API (DB é source of truth) |
| AD-M3-02 | `ChatContext` no `LayoutProvider` |
| AD-M3-03 | `limit=3` sessões WEB |
| AD-M3-04 | `localStorage` como hint de sessão ativa |
| AD-M3-05 | "Nova conversa" limpa UI; próximo envio cria sessão nova |

## API

- `GET /chat/sessions?limit=3` — lista sessões WEB do usuário
- `GET /chat/sessions/:id/messages` — mensagens USER/ASSISTANT (ownership validado)

## UAT checklist

- [ ] Desktop xl: scroll com 10+ mensagens ou texto longo
- [ ] Mobile: abrir sheet → conversar → fechar → reabrir → histórico intacto
- [ ] Refresh da página → última conversa restaurada
- [ ] Alternar entre 2–3 conversas recentes (chips)
- [ ] "Nova conversa" → thread vazia; primeira mensagem cria nova sessão no DB
- [ ] Sem texto "78%" ou progresso semanal fake
- [x] `pnpm build` OK

## Referências

- Plano: `.cursor/plans/maint-m3_ai-hub_chat_fix.plan.md`
- Feature base: `F06-chat-inteligente`

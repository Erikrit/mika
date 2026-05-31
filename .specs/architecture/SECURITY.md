# Security — Mika

**Status:** Draft  
**Last Updated:** 2026-05-31

---

## Contexto

Mika armazena dados **altamente sensíveis**: saúde, finanças, família, terapia, relacionamentos. Segurança é requisito desde a v1, não adiável.

---

## Autenticação e Autorização

| Aspecto | v1 | Futuro |
|---------|-----|--------|
| Auth web | JWT access (15min) + refresh (7d) em httpOnly cookie | OAuth Google |
| Auth Telegram | Vinculação chatId ↔ userId via código one-time | — |
| Autorização | Single user — todas queries filtradas por userId | RBAC multi-user |
| API keys | Nenhuma exposta no frontend | — |

**Regras:**

- WHEN request chega sem token válido THEN API SHALL retornar 401
- WHEN userId do token ≠ userId do recurso THEN API SHALL retornar 403
- WHEN Telegram webhook recebido THEN API SHALL validar secret token do BotFather

---

## Proteção de Dados

| Dado | Proteção |
|------|----------|
| Reflections (diário) | Criptografia AES-256 at-rest (campo content) |
| FinanceGoals | Criptografia at-rest |
| ChatMessage history | Sem criptografia v1 (performance); avaliar v2 |
| Passwords/tokens | bcrypt ou nunca armazenados (JWT only) |
| OpenAI API key | Variável de ambiente, nunca no código |
| Telegram token | Variável de ambiente |

---

## Transporte

- HTTPS obrigatório em produção (Let's Encrypt via Caddy ou Nginx)
- Webhook Telegram: HTTPS only
- HSTS header habilitado
- CORS restrito ao domínio do frontend

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| POST /chat/message | 30 req/min por user |
| Telegram messages | 20 msg/min por chatId |
| Auth endpoints | 5 req/min por IP |
| CRUD geral | 100 req/min por user |

Implementar via `@nestjs/throttler` + Redis.

---

## Logs e Privacidade

- **Nunca** logar conteúdo de reflections, chat ou dados financeiros
- Logs contêm apenas: requestId, userId, endpoint, status, latency
- Retenção de logs: 30 dias
- OpenAI: desabilitar training (`store: false` na API)

---

## LGPD (Preparação)

| Direito | Implementação |
|---------|---------------|
| Acesso | GET /users/me/export — JSON completo |
| Exclusão | DELETE /users/me — cascade all data |
| Portabilidade | Export JSON + Markdown |
| Consentimento | Termo na primeira configuração |

---

## Backup e Recuperação

- Backup PostgreSQL diário (pg_dump) → volume secundário ou S3
- Retenção: 7 dias rolling
- Teste de restore mensal manual
- Ver INFRA.md para detalhes

---

## Checklist Pré-Produção

- [ ] HTTPS configurado
- [ ] Secrets em .env (nunca commitados)
- [ ] .env.example sem valores reais
- [ ] Rate limiting ativo
- [ ] CORS configurado
- [ ] Telegram webhook secret validado
- [ ] Logs sem dados sensíveis
- [ ] Backup automatizado

# Convenções do Projeto Mika

**Last Updated:** 2026-05-31  
**Aplica-se a:** Todas as features, milestones e quick tasks

Estas regras evitam retrabalho e alinham agentes e desenvolvedores. Consulte também [STATE.md](./STATE.md) (decisions AD-009, AD-010).

---

## 1. Testes unitários — fora do escopo

**Testes unitários não fazem parte do fluxo de entrega.**

| Fazer | Não fazer |
|-------|-----------|
| Validar com **build** (`pnpm build`, `prisma:migrate`, etc.) | Criar arquivos `*.spec.ts` / `*.test.ts` em novas features |
| Validar com **UAT manual** quando a feature for user-facing | Usar `jest pass` ou `pnpm test` como **gate** de task |
| Manter testes legados se já existirem, sem expandir | Bloquear entrega por ausência ou falha de testes unitários |

**Gates aceitos:** build OK, migrate OK, smoke manual, checklist UAT documentado.

**Onda F / validação:** substituir task de “testes unit” por sync de docs + UAT manual (ver [M4 tasks](../features/M4-contexto-pessoal/tasks.md)).

---

## 2. Idioma — português brasileiro (pt-BR)

**Todo conteúdo voltado ao usuário e toda documentação de produto devem estar em pt-BR.**

### Obrigatório em pt-BR

- Textos de **UI** (títulos, descrições, placeholders, botões, toasts, empty states)
- **Labels** visíveis (sidebar, abas, badges, filtros)
- Mensagens de **API** expostas ao cliente (`NotFoundException`, validação, feedback de import)
- `@ApiOperation({ summary: '...' })` e descrições Swagger voltadas ao usuário
- Arquivos em `.specs/` (spec, design, tasks, STATE, ROADMAP, README operacional)
- Comentários em docs de feature e checklists UAT
- Nomes de **pastas de feature** em `.specs/features/` (slug descritivo em português, ex.: `M4-contexto-pessoal`)

### Permanece em inglês (padrão técnico)

- Identificadores de código: variáveis, funções, classes, enums Prisma, rotas REST (`/memory/chunks`)
- Nomes de pacotes npm e pastas de app (`apps/api`, `packages/ai`)
- Commits: preferir **português** na mensagem (alinhado ao repositório), corpo opcional em pt-BR

### Exemplos

| Contexto | Correto | Evitar |
|----------|---------|--------|
| Botão import | `Importar` | `Upload` |
| Aba saúde | `Saúde` | `Health` |
| Toggle RAG | `RAG ligado` / `RAG desligado` | `RAG on` / `RAG off` |
| Erro API | `Documento não encontrado` | `Document not found` |
| Task gate | `listagem funcional` | `jest pass` |

---

## 3. Checklist rápido antes de fechar uma task

- [ ] Build dos pacotes/apps afetados passou
- [ ] Nenhum teste unitário novo foi adicionado como requisito de done
- [ ] Strings visíveis ao Erik estão em pt-BR
- [ ] Spec/tasks/design atualizados em pt-BR se houve mudança de escopo

---

## Referências

- [STATE.md](./STATE.md) — decisões AD-009 (sem unit tests) e AD-010 (pt-BR)
- [PROJECT.md](./PROJECT.md) — visão e stack
- Skill `tlc-spec-driven` — carregar este arquivo ao implementar features

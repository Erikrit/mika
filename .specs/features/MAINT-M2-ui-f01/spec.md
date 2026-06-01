# MAINT-M2 — UI web F01 (assistente pessoal)

**Status:** Done (local) · UAT validado  
**Gate:** `pnpm build` + UAT manual  
**Relacionado:** F01-centralizacao (CENT-09)

---

## Objetivo

Fechar lacuna CENT-09: CRUD visual para objetivos, projetos, agenda e reflexões, com navegação coerente. Finanças, Estudos e Insights ocultos; backend intacto.

## Escopo entregue

| Entidade | UI |
|----------|-----|
| Tarefas | CRUD em `/tasks` + sidebar |
| Objetivos | CRUD em `/goals` |
| Projetos | CRUD em `/projects` |
| Agenda | CRUD em `/events` + filtro de período |
| Reflexões | create/list/delete em `/reflections` |
| Estudos / Insights | rotas redirecionam para `/` (AD-014) |
| Dashboard | removido progresso semanal hardcoded (78%) |

## Fora de escopo

- Finanças UI (AD-013, v2/v3)
- Edição de reflexões (API sem PATCH)
- Testes unitários (AD-009)

## Referências

- Padrão modal: `apps/web/src/app/(app)/tasks/page.tsx`
- Schemas: `packages/shared/src/schemas/index.ts`
- Plano: `.cursor/plans/maint-m2_ui_f01_777f1fe8.plan.md`

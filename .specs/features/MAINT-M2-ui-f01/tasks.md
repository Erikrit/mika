# MAINT-M2 — Tasks

| ID | Task | Gate | Status |
|----|------|------|--------|
| T111 | Sidebar: Tarefas + Reflexões; ocultar Estudos/Insights | nav OK | ✅ |
| T112 | Redirect `/studies`, `/insights` | rotas redirecionam | ✅ |
| T113 | Estender api-client | build web | ✅ |
| T114 | CRUD Objetivos | criar/editar/excluir via UI | ✅ |
| T115 | CRUD Projetos | idem | ✅ |
| T116 | CRUD Agenda + filtro período | idem + lembrete via API | ✅ |
| T117 | Reflexões list/create/delete | visual Companion OS | ✅ |
| T118 | Remover progresso semanal fake no dashboard | sem hardcode 78% | ✅ |
| T119 | Spec + sync STATE/ROADMAP/VISUAL-DESIGN | docs | ✅ |
| T120 | UAT manual | checklist Erik | ✅ |

## UAT checklist

- [x] Sidebar: Tarefas, Reflexões visíveis; Estudos/Insights ausentes
- [x] `/studies` e `/insights` voltam ao início
- [x] Objetivos: criar → editar progresso → excluir
- [x] Projetos: criar → alterar status → excluir
- [x] Agenda: criar evento amanhã → listagem filtrada → editar → excluir
- [x] Reflexões: escrever → listar → excluir
- [x] Dashboard: compromissos/tarefas refletem CRUD
- [x] `pnpm build` OK

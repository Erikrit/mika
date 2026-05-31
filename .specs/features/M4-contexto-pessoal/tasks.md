# M4 — Tasks (T051–T086)



> Numeração global continua após F04 (T050). Mapeamento interno do plano M4: T036→T051 … T061→T076; replanejamento UX: T077–T086.



## Onda A — Fundação dados



| ID | Task | Status | Gate |

|----|------|--------|------|

| T051 | Enums + tipos shared | Done | build shared |

| T052 | Prisma models + migration | Done | pnpm prisma:migrate |

| T053 | Seed backfill chunks legados | Done | script OK |



## Onda B — API documentos e governança



| ID | Task | Status | Gate |

|----|------|--------|------|

| T054 | ContextDocument CRUD + Swagger | Done | CRUD funcional |

| T055 | Versionamento reimport/edit | Done | 2 versões em GET |

| T056 | PATCH/DELETE chunk + cascade doc | Done | chunk removido |

| T057 | GET /memory/health | Done | JSON métricas |

| T058 | MemoryUsageAudit + GET /memory/audit | Done | log após chat |



## Onda C — Pipeline indexação



| ID | Task | Status | Gate |

|----|------|--------|------|

| T059 | Classificador heurístico worker | Done | Objetivos→FIXED |

| T060 | Classificação LLM fallback | Done | env flag |

| T061 | Estender import API + documentId | Done | POST cria doc |

| T062 | CRUD sources → EVOLUTIVE + FACT | Done | task reindex |



## Onda D — Retrieval seguro



| ID | Task | Status | Gate |

|----|------|--------|------|

| T063 | Filtros intent → hybridSearch | Done | finance ≠ relationship |

| T064 | Threshold SENSITIVE + enabledForRag | Done | disabled nunca no prompt |

| T065 | Scoring importance + recency | Done | ranking alterado |

| T066 | System prompt F08 + FIXED injection | Done | chat cita perfil |

| T067 | Audit ChatService + Telegram | Done | registro audit |



## Onda E — UI /context



| ID | Task | Status | Gate |

|----|------|--------|------|

| T068 | Página /context abas | Done | listagem funcional |

| T069 | Form import + metadados | Done | upload indexa |

| T070 | Painel governança toggles | Done | enabledForRag persiste |

| T071 | Aba Saúde + Auditoria | Done | métricas visíveis |

| T072 | Redirect /memories + sidebar | Done | redirect OK |



## Onda F — Validação



| ID | Task | Status | Gate |

|----|------|--------|------|

| T073 | ~~Testes unit~~ | Cancelled | **Fora de escopo** — ver [CONVENTIONS.md](../../project/CONVENTIONS.md) AD-009 |

| T074 | Checklist UAT manual | Done | Erik validou 2026-05-31 |

| T075 | README, ROADMAP, STATE sync | Done | docs |

| T076 | Commits atômicos por task | Pending | git log legível |



## Onda G — Perfil e Contexto UX (replanejamento 2026-05-31)



| ID | Task | Status | Gate |

|----|------|--------|------|

| T077 | Filtro por categoria no hybridSearch (JOIN context_documents) | Done | build api |

| T078 | Sync metadados documento → chunks no PATCH | Done | PATCH propaga |

| T079 | GET versão individual + preview em listagem | Done | endpoint OK |

| T080 | source manual no create + schema | Done | editor cria manual |

| T081 | context-templates.ts (3 modelos pt-BR) | Done | templates visíveis |

| T082 | Hub /context: abas Perfil/Avançado, lista agrupada | Done | UI hub |

| T083 | Editor /context/[id] + histórico versões | Done | salvar/reimport |

| T084 | Avançado: override chunk + excluir + arquivados | Done | governança UI |

| T085 | Perfil FIXED nas rotinas (ROUTINE_INCLUDE_FIXED_PROFILE) | Done | generateRoutine |

| T086 | api-client: createDocument, reimport, getVersions | Done | build web |



> **Regras do projeto:** testes unitários não são gate; UI/docs em pt-BR ([CONVENTIONS.md](../../project/CONVENTIONS.md)).



**Dependências:** A → B → C → D; E paralelo após B (T054); G após D; F (UAT) ao final.



## Checklist UAT (T074)



- [x] Criar "Perfil para a Mika" via template → editar tom → salvar → chat adapta estilo

- [x] Importar Objetivos de Vida → pergunta no chat usa contexto

- [x] Marcar doc financeiro SENSITIVE + RAG off → chat não expõe

- [x] Editar conteúdo → versão v2 visível no histórico

- [x] Rotina matinal menciona objetivos/perfil quando flag ativa

- [x] Aba Avançado: trechos/saúde/auditoria compreensíveis

- [x] `/memories` redireciona para `/context`

- [x] `pnpm build` OK; migration aplicada


# F02 — Memória de Longo Prazo

## Problem Statement

Sem memória persistente e busca contextual, Mika esquece contextos entre sessões. Erik precisa perguntar "Como está meu planejamento para João Pessoa?" e receber resposta baseada em todo histórico relevante — não apenas na conversa atual.

## Goals

- [ ] Vetorizar conteúdo de tarefas, projetos, objetivos, reflexões e notas
- [ ] Busca híbrida: embeddings (pgvector) + full-text (PostgreSQL)
- [ ] Categorização por LifeArea na retrieval
- [ ] Respostas contextuais sobre projetos, objetivos e eventos futuros

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fine-tuning de modelo | Future |
| Memória episódica (summarize sessions) | Future |
| Sync bidirecional Notion | Import only |
| Multi-modal (imagens, áudio) | Future |

---

## User Stories

### P1: Vetorizar Conteúdo Automaticamente ⭐ MVP

**User Story**: As Erik, I want my tasks, projects and reflections automatically indexed so that Mika remembers them in future conversations.

**Why P1**: Sem indexação, RAG não funciona.

**Acceptance Criteria**:

1. WHEN task/project/goal/reflection is created or updated THEN worker SHALL generate embedding and store in MemoryChunk within 60s
2. WHEN embedding generation fails THEN worker SHALL retry 3x with exponential backoff and log error
3. WHEN content is deleted THEN system SHALL remove associated MemoryChunks

**Independent Test**: Criar projeto "João Pessoa", aguardar embedding, verificar MemoryChunk no DB.

---

### P1: Busca Contextual ⭐ MVP

**User Story**: As Erik, I want to ask about any project or goal and get relevant context so that I don't need to remember details myself.

**Why P1**: Core value proposition — memória externa.

**Acceptance Criteria**:

1. WHEN user asks "Como está João Pessoa?" THEN system SHALL retrieve MemoryChunks with similarity > 0.7 related to project
2. WHEN retrieval returns results THEN system SHALL include metadata (type, date, lifeArea) in LLM context
3. WHEN no relevant chunks found THEN system SHALL respond honestly: "Não encontrei informações sobre isso"

**Independent Test**: Perguntar sobre projeto existente → resposta contextual. Perguntar sobre projeto inexistente → resposta honesta.

---

### P2: Ingestão de Markdown

**User Story**: As Erik, I want to upload Markdown files so that existing notes become searchable memory.

**Acceptance Criteria**:

1. WHEN user uploads .md file THEN system SHALL parse, chunk by heading, embed and store
2. WHEN frontmatter contains `area: financial` THEN chunks SHALL be tagged with LifeArea financial

**Independent Test**: Upload nota.md sobre finanças, buscar "investimentos" → retorna chunk.

---

### P2: Categorias de Memória

**User Story**: As Erik, I want memory organized by life areas so that queries can be scoped.

**Acceptance Criteria**:

1. WHEN querying with lifeArea filter THEN system SHALL only return chunks from that area
2. WHEN displaying memory THEN system SHALL show category label (Profissional, Financeiro, etc.)

**Independent Test**: Buscar na área Saúde → não retorna chunks de Viagens.

---

## Edge Cases

- WHEN content < 10 chars THEN system SHALL skip embedding (too short)
- WHEN duplicate content detected (hash match) THEN system SHALL update existing chunk, not duplicate
- WHEN pgvector index not built THEN system SHALL fall back to full-text only

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| MEM-01 | P1: Vetorizar | Design | Pending |
| MEM-02 | P1: Busca Contextual | Design | Pending |
| MEM-03 | P2: Markdown Ingest | - | Pending |
| MEM-04 | P2: Categorias | Design | Pending |

---

## Success Criteria

- [ ] Retrieval relevante em >80% das queries sobre projetos existentes
- [ ] Embedding latency < 5s por item
- [ ] Query latency < 3s P95 (incluindo LLM)

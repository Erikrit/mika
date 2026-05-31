# F01 — Centralização de Informações — Design

**Spec**: `.specs/features/F01-centralizacao/spec.md`  
**Status**: Approved

---

## Architecture Overview

F01 implementa a camada de dados central do Mika: API REST NestJS + Prisma + PostgreSQL, consumida por UI web Next.js e (parcialmente) Telegram Bot.

```mermaid
graph TD
    WEB[Next.js PWA] -->|REST| API[NestJS API]
    TG[Telegram Bot] -->|REST internal| API
    API --> PRISMA[Prisma ORM]
    PRISMA --> PG[(PostgreSQL)]
    API --> SHARED[@mika/shared Zod schemas]
    WEB --> SHARED
```

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
|-----------|----------|------------|
| Zod schemas | `packages/shared/src/schemas/` | Validação compartilhada API + Web |
| Prisma client | `packages/database/` | ORM type-safe |
| Types | `packages/shared/src/types/` | DTOs compartilhados |

### Integration Points

| System | Integration Method |
|--------|-------------------|
| PostgreSQL | Prisma via DATABASE_URL |
| Telegram (M1 parcial) | TelegramModule calls TasksModule/ProjectsModule |
| Future F02 | MemoryModule will hook into entity create/update events |

---

## Components

### TasksModule

- **Purpose**: CRUD de tarefas com prioridade, due date, life area e subtarefas
- **Location**: `apps/api/src/modules/tasks/`
- **Interfaces**:
  - `create(dto: CreateTaskDto): Task`
  - `findAll(filters: TaskFilters): Task[]`
  - `findOne(id: string): Task`
  - `update(id: string, dto: UpdateTaskDto): Task`
  - `remove(id: string): void`
  - `complete(id: string): Task`
- **Dependencies**: PrismaService, LifeAreasModule
- **Reuses**: `@mika/shared` CreateTaskSchema, TaskFiltersSchema

### ProjectsModule

- **Purpose**: CRUD de projetos com progress tracking
- **Location**: `apps/api/src/modules/projects/`
- **Interfaces**:
  - `create(dto: CreateProjectDto): Project`
  - `findAll(filters: ProjectFilters): Project[]`
  - `findOne(id: string): ProjectWithProgress`
  - `update(id: string, dto: UpdateProjectDto): Project`
  - `remove(id: string): void`
- **Dependencies**: PrismaService, TasksModule (for progress calc)
- **Reuses**: Shared schemas

### GoalsModule

- **Purpose**: CRUD de objetivos com horizon e progress
- **Location**: `apps/api/src/modules/goals/`

### EventsModule

- **Purpose**: CRUD de eventos/compromissos
- **Location**: `apps/api/src/modules/events/`

### ReflectionsModule

- **Purpose**: CRUD de reflexões com criptografia at-rest
- **Location**: `apps/api/src/modules/reflections/`
- **Dependencies**: EncryptionService (AES-256)

### FinanceGoalsModule

- **Purpose**: Metas financeiras básicas
- **Location**: `apps/api/src/modules/finance-goals/`
- **Dependencies**: EncryptionService

### LifeAreasModule

- **Purpose**: Seed e listagem de áreas de vida
- **Location**: `apps/api/src/modules/life-areas/`
- **Interfaces**:
  - `seedForUser(userId: string): LifeArea[]`
  - `findAll(userId: string): LifeArea[]`

### Web Dashboard

- **Purpose**: UI mínima — dashboard + CRUD forms
- **Location**: `apps/web/src/app/`
- **Pages**:
  - `/` — Dashboard (today's tasks + events)
  - `/tasks` — Task list + create/edit
  - `/projects` — Project list
  - `/goals` — Goals list
  - `/events` — Events calendar view (simple list v1)

---

## Data Models

Ver `.specs/architecture/DATA-MODEL.md` para schemas completos.

### Prisma Schema (Core excerpt)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  timezone      String   @default("America/Sao_Paulo")
  telegramChatId String?
  preferences   Json     @default("{}")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lifeAreas     LifeArea[]
  tasks         Task[]
  projects      Project[]
  goals         Goal[]
  events        Event[]
  reflections   Reflection[]
  financeGoals  FinanceGoal[]
}

model LifeArea {
  id     String @id @default(uuid())
  userId String
  slug   String
  label  String
  color  String?
  user   User   @relation(fields: [userId], references: [id])
  @@unique([userId, slug])
}

model Task {
  id           String    @id @default(uuid())
  userId       String
  projectId    String?
  lifeAreaId   String?
  parentTaskId String?
  title        String
  description  String?
  status       TaskStatus @default(TODO)
  priority     Int       @default(3)
  dueAt        DateTime?
  completedAt  DateTime?
  energyLevel  String?
  contextTags  String[]
  neglectedSince DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  user         User      @relation(fields: [userId], references: [id])
  project      Project?  @relation(fields: [projectId], references: [id])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  CANCELLED
}
```

---

## API Endpoints (F01)

| Method | Path | Description |
|--------|------|-------------|
| GET | /life-areas | List life areas |
| GET/POST | /tasks | List / Create tasks |
| GET/PATCH/DELETE | /tasks/:id | Read / Update / Delete |
| POST | /tasks/:id/complete | Mark done |
| GET/POST | /projects | List / Create |
| GET/PATCH/DELETE | /projects/:id | Read / Update / Delete |
| GET/POST | /goals | List / Create |
| GET/PATCH/DELETE | /goals/:id | CRUD |
| GET/POST | /events | List / Create |
| GET/PATCH/DELETE | /events/:id | CRUD |
| GET/POST | /reflections | List / Create |
| GET/POST | /finance-goals | List / Create |
| GET | /dashboard/today | Today's tasks + events aggregated |

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
|----------------|----------|-------------|
| Validation fail (Zod) | 400 + field errors | Form highlights invalid fields |
| Entity not found | 404 | "Item não encontrado" |
| Unauthorized | 401 | Redirect to login |
| DB connection fail | 503 | "Serviço temporariamente indisponível" |
| Encryption fail | 500 + log | "Erro ao salvar, tente novamente" |

---

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Prisma | Type-safe, migrations, boa DX com NestJS |
| Validation | Zod (shared) | Single source of truth API + frontend |
| Auth v1 | Single hardcoded user + JWT | MVP single-user; auth completo em task separada |
| UI lib | shadcn/ui + Tailwind | Componentes acessíveis, customizáveis |
| Date handling | date-fns + user timezone | Corrige "today" queries |

---

## Security (F01 specific)

- Reflections.content → AES-256 encrypt before save, decrypt on read
- FinanceGoal amounts → AES-256 encrypt
- All queries filtered by userId from JWT
- Input sanitization via Zod (no raw SQL)

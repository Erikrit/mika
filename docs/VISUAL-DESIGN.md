# Visual Design Specification — Mika Companion OS

**Versão:** 1.0  
**Status:** Implementado (Fase 1 — Fundação UI)  
**Última revisão:** 2026-05-31

---

## Objetivo Visual

Criar uma experiência que faça o usuário sentir que a assistente é uma **presença constante** em sua vida, atuando como um segundo cérebro digital.

A interface **não** deve parecer um chatbot tradicional. O usuário deve sentir que está acessando seu próprio **sistema operacional pessoal**.

### Inspirações

| Referência | Contribuição |
|------------|--------------|
| Neo | Presença da IA, avatar abstrato |
| Obsidian | Workspace limpo, foco no conteúdo |
| Motion | Organização e fluidez |
| Jarvis | Inteligência discreta, always-on |
| Linear | Minimalismo, tipografia, densidade controlada |

---

## Conceito: Companion Operating System

A assistente transmite: **proximidade**, **inteligência**, **calma**, **organização** e **evolução contínua**.

| Sensação desejada | Sensação a evitar |
|-------------------|-------------------|
| "Minha vida está organizada aqui." | "Estou conversando com um chatbot." |
| "Este sistema me conhece." | "Mais um app de produtividade." |

### Proporção emocional

| Dimensão | Peso |
|----------|------|
| Organização | 60% |
| Companheirismo | 25% |
| Futurismo | 10% |
| Tecnologia | 5% |

---

## Design Language

Mistura de:

- Glassmorphism leve
- Dark Premium
- Minimalismo moderno
- Dashboard pessoal
- Interface futurista discreta

**Evitar:** neon excessivo, visual gamer, cyberpunk exagerado, aparência corporativa fria.

---

## Paleta de Cores

Implementada em `apps/web/src/app/globals.css` como tokens Tailwind.

### Base

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-bg-primary` | `#0B1120` | Background principal |
| `--color-bg-secondary` | `#111827` | Background secundário, sidebar, header |
| `--color-surface` | `#1E293B` | Cards |
| `--color-border` | `#334155` | Bordas |

### Destaques

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-accent` | `#3B82F6` | Azul inteligência — ações, links, IA |
| `--color-progress` | `#10B981` | Verde progresso — metas, barras |
| `--color-attention` | `#F59E0B` | Laranja atenção — alertas leves |
| `--color-critical` | `#EF4444` | Vermelho crítico — erros, atrasos |
| `--color-insight` | `#8B5CF6` | Roxo insights — sugestões, análises |

### Texto

| Token | Hex |
|-------|-----|
| `--color-text-primary` | `#F8FAFC` |
| `--color-text-secondary` | `#CBD5E1` |
| `--color-text-tertiary` | `#94A3B8` |

---

## Tipografia

| Aspecto | Valor |
|---------|-------|
| Fonte principal | **Inter** (`apps/web/src/app/layout.tsx`) |
| Alternativas | Geist, SF Pro, Manrope |
| Pesos | 400, 500, 600, 700 |

---

## Layout Principal

```
┌──────────────────────────────┐
│ Header                       │
├─────────┬───────────┬────────┤
│ Sidebar │ Workspace │ AI Hub │
└─────────┴───────────┴────────┘
```

| Região | Componente | Arquivo |
|--------|------------|---------|
| Header | Barra superior com data, saudação e toggle da IA | `components/layout/header.tsx` |
| Sidebar | Navegação fixa (240px) | `components/layout/sidebar.tsx` |
| Workspace | Área central de conteúdo | `components/layout/app-shell.tsx` |
| AI Hub | Painel direito da assistente | `components/layout/ai-hub.tsx` |

### Sidebar — itens de navegação

| Rota | Label |
|------|-------|
| `/` | Início |
| `/tasks` | Tarefas |
| `/context` | Contexto |
| `/goals` | Objetivos |
| `/projects` | Projetos |
| `/events` | Agenda |
| `/reflections` | Reflexões |
| `/settings` | Configurações |

> **Finanças (`/finance`):** adiado v2/v3 — rota redireciona para início; API `FinanceGoalsModule` permanece no backend (AD-013).

> **Estudos (`/studies`) e Insights (`/insights`):** adiados v2+ — rotas redirecionam para início (AD-014).

Ícones via Lucide (equivalente visual aos emojis da spec, com consistência cross-platform).

### AI Hub

Sempre presente em telas `xl` (≥1280px). Em telas menores, acessível via botão flutuante e sheet lateral — a IA nunca fica completamente inacessível.

Exibe:

- Avatar da assistente
- Saudação personalizada
- Próximas ações
- Insights
- Sugestões
- Campo de chat (placeholder — F06)

---

## Avatar da Assistente

Componente: `components/ui/mika-avatar.tsx`

- Esfera luminosa com gradiente azul → roxo
- Animação `breathe` (3s, sutil)
- Sem avatares humanos realistas
- Transmite inteligência, confiança e neutralidade

---

## Cards

Componente: `components/ui/mika-card.tsx`

| Propriedade | Valor |
|-------------|-------|
| Border radius | `16px` (`rounded-2xl`) |
| Padding | `24px` (`p-6`) |
| Background | `#1E293B` (`bg-surface`) |
| Sombra | `shadow-sm`, hover `shadow-md` |
| Animação hover | `transition-all duration-200` |

Classe utilitária `.glass` disponível para glassmorphism leve (login, overlays).

---

## Dashboard Inicial

Página: `apps/web/src/app/(app)/page.tsx`

Ao abrir o sistema:

```
Bom dia, Erik.

Hoje você possui:
• 2 tarefas prioritárias
• 1 meta financeira em andamento
• 1 projeto aguardando ação

Seu progresso semanal está em 78%.
```

Dados dinâmicos vindos da API; progresso semanal fixo em 78% até implementação de métricas reais (F04).

---

## Animações

| Animação | Duração | Uso |
|----------|---------|-----|
| `fade-in` | 300ms | Entrada de páginas (`.page-enter`) |
| `breathe` | 3s loop | Avatar da Mika |
| Transições UI | 200ms | Hover, sidebar, links |

Sensação alvo: **rápido e inteligente** — sem efeitos chamativos ou transições lentas.

---

## Modo Escuro

Modo **padrão e único** na v1. Classe `dark` aplicada no `<html>`. Modo claro é secundário e não está implementado.

`themeColor` PWA: `#0B1120`.

---

## Mapeamento Spec → Implementação

| Requisito | Status | Notas |
|-----------|--------|-------|
| Paleta de cores | ✅ | Tokens em `globals.css` |
| Layout 3 colunas | ✅ | Header + Sidebar + Workspace + AI Hub |
| Sidebar fixa com 8 itens (Início, Tarefas, Contexto, Objetivos, Projetos, Agenda, Reflexões, Config) | ✅ | `sidebar.tsx` |
| AI Hub sempre presente | ⚠️ | Desktop: fixo; mobile: FAB + sheet |
| Avatar esfera luminosa | ✅ | `mika-avatar.tsx` |
| Cards 16px / 24px | ✅ | `mika-card.tsx` |
| Dashboard inicial | ✅ | `page.tsx` |
| Inter + dark mode | ✅ | `layout.tsx` |
| Glassmorphism leve | ✅ | `.glass`, header blur |
| Animações 200–300ms | ✅ | CSS + Tailwind |
| Login Companion OS | ✅ | `login/page.tsx` |

---

## Prioridades de Design

1. Clareza
2. Organização
3. Proximidade
4. Inteligência
5. Futurismo discreto

---

## Referência rápida para desenvolvedores

### Setup Tailwind v4 (obrigatório)

O frontend usa Tailwind CSS v4 com PostCSS. Sem esta configuração, **nenhum utilitário CSS é gerado** e o layout aparece quebrado.

| Arquivo | Função |
|---------|--------|
| [`apps/web/postcss.config.mjs`](../apps/web/postcss.config.mjs) | Plugin `@tailwindcss/postcss` |
| [`apps/web/src/app/globals.css`](../apps/web/src/app/globals.css) | `@import "tailwindcss"` + `@source` para scan dos `.tsx` |

Após alterar tokens ou adicionar classes, reinicie o dev server (`pnpm --filter web dev`).

### Assets PWA em `apps/web/public/`

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `icon-192.png` | 192×192 | Manifest, favicon, Apple touch |
| `icon-512.png` | 512×512 | Manifest splash / instalação PWA |
| `manifest.json` | — | Metadados PWA |

Design dos ícones: esfera gradiente azul → roxo sobre fundo `#0B1120`, alinhado ao `MikaAvatar`.

### Classes e componentes

```tsx
// Cores semânticas
className="bg-bg-primary text-text-primary border-border bg-surface text-accent text-progress text-insight text-critical"

// Card padrão
<MikaCard>...</MikaCard>

// Avatar
<MikaAvatar size="sm" | "md" | "lg" />

// Glassmorphism
className="glass"
```

Ao criar novas telas, reutilize `MikaCard`, `PageHeader`, `EmptyState` e `StatCard` para manter consistência visual.

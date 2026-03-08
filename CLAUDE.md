# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
pnpm dev          # Vite dev server (https://localhost:5173)
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking (tsc --noEmit)
pnpm supabase migration new <name>   # Create migration
pnpm supabase migration up --linked  # Apply pending migrations to remote
```

## Architecture

Single-page Kanban board with real-time sync via Supabase Postgres changes.

**Data flow:** App.tsx (boards) → BoardView.tsx (all board state + mutations) → Board.tsx (DnD layout) → Column.tsx / Card.tsx (display)

**Key boundaries:**
- App.tsx owns board-level state and sidebar. Seeds default labels when creating a board.
- BoardView.tsx owns all state within a board (columns, cards, labels, card_labels, comments, checklist_items). Every DB write goes through `enqueue()` from mutationQueue.ts. Remounts on board switch via `key={boardId}`.
- Board.tsx is pure DnD orchestration — no data fetching or mutations.
- CardDetailModal.tsx and QuickEditPopup.tsx are editing surfaces that call back to BoardView mutations via props.

**Mutation queue:** All Supabase writes are serialized through a FIFO queue (mutationQueue.ts). Optimistic UI updates happen synchronously; only the DB write is queued. Never bypass this — always use `enqueue()` for writes.

**Ordering:** All positional ordering uses `fractional-indexing`. Sort with plain `<` / `>` operators, never `localeCompare`.

**DnD:** @dnd-kit with custom collision detection — `closestCenter` filtered to columns-only when dragging columns, `closestCorners` for cards.

## Database

Supabase project `hsuiztvjcylwtljrtyik`. Tables: boards, columns, cards, labels, card_labels, comments, checklist_items. All have RLS enabled with open anon policies. Realtime enabled on all tables. Migrations in `supabase/migrations/`.

Each board gets 6 default colored labels (seeded via migration for existing boards, via App.tsx `addBoard` for new boards).

## Keyboard Shortcuts

Global shortcuts in BoardView (skipped when typing in inputs or when modal/popup is open):
- `N` — new card in first column
- `E` — quick edit hovered card
- `L` — quick edit hovered card with labels open
- `Esc` — close modal/popup
- `?` — toggle help overlay

## Principles

- Do not base decisions on assumptions about app scope (e.g., "single-user" or "portfolio project"). Treat all code as production-grade.

## Patterns

- Client-generated UUIDs for optimistic inserts (`crypto.randomUUID()`)
- Realtime subscriptions in useEffect, scoped to board_id where possible
- Supabase CLI installed locally via pnpm (not global)
- Labels use a fixed color palette defined in `LABEL_COLORS` (types.ts)

Project Setup

# Prerequisites

  - Node.js 20+
  - pnpm 10+
  - Docker Desktop (for Supabase CLI local operations)

# Supabase

Project: Kanban
Region: Northeast Asia (Tokyo)
Reference ID: hsuiztvjcylwtljrtyik
Dashboard: https://supabase.com/dashboard/project/hsuiztvjcylwtljrtyik

# Environment Variables

Copy to .env at project root:

  VITE_SUPABASE_URL=https://hsuiztvjcylwtljrtyik.supabase.co
  VITE_SUPABASE_ANON_KEY=<from dashboard Settings > API>
  VITE_LIVEBLOCKS_PUBLIC_KEY=<from liveblocks.io dashboard>

# Database Schema

  boards      (id, title, position, archived)
  columns     (id, board_id, title, position, archived)
  cards       (id, column_id, title, description, position, archived, due_date, cover_color)
  labels      (id, board_id, title, color, position)
  card_labels (card_id, label_id) -- junction table
  comments    (id, card_id, author_name, content, created_at)

All tables: RLS enabled, open anon policy, realtime enabled.

Migrations (in supabase/migrations/):
  20260306133156_spike_items.sql        -- spike table
  20260307000000_kanban_tables.sql      -- columns + cards
  20260307100000_boards_table.sql       -- boards + board_id on columns
  20260307110000_labels_and_due_dates.sql -- labels, card_labels, due_date
  20260307120000_comments_and_cover.sql -- comments table, cover_color on cards
  20260307130000_seed_default_labels.sql -- 6 default colored labels per board

# Supabase CLI

Installed locally via pnpm (not global). Already linked to the
project. Common commands:

  pnpm supabase migration new <name>   -- create migration
  pnpm supabase migration up --linked  -- apply pending migrations
  pnpm supabase db dump --schema public -- dump remote schema

Do not use db reset --linked unless you intend to drop everything.

# Dev Server

  pnpm dev        -- start Vite dev server (https://localhost:5173)
  pnpm typecheck  -- run TypeScript type checking

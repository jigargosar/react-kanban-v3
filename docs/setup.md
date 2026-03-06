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

Spike Insights

# Broadcast Model

Writer receives their own broadcast — confirmed. All clients
(including the writer) get the same postgres_changes event. No
need to distinguish "my update vs remote update."

# Optimistic Insert Pattern

Race condition: optimistic add with temp ID + broadcast INSERT
causes duplicates. The .then callback and broadcast race to
provide the real ID.

Solution: generate UUID client-side via crypto.randomUUID() and
pass it in the insert. Optimistic item already has the real ID.
Broadcast arrives with same ID — handled as upsert.

# Upsert as Universal Handler

INSERT and UPDATE broadcasts handled identically: replace if item
exists, add if new. Server always wins. DELETE removes the item.
No event-type-specific logic needed for INSERT vs UPDATE.

# Presence

Supabase Realtime Presence works via channel.track() / presenceState().
Sync event fires on any change. Shows connected users within 1-2s.
More manual than Liveblocks (no useOthers hook), but functional.

# Postgres Changes Payload

Broadcast includes full new row for INSERT/UPDATE. For DELETE,
only old.id is available by default (need REPLICA IDENTITY FULL
for full old row).

# Supabase CLI

  a. db reset --linked drops everything — all schemas, all auth
     data. Never use casually.
  b. migration up --linked applies only pending migrations — safe.
  c. Custom schemas (e.g., spike) require exposing in dashboard
     API settings + explicit grants. Using public schema avoids this.
  d. supabase init creates .gitignore and config.toml.
Supabase Realtime Library Evaluation

# Realtime Modes

  a. Postgres Changes -- listen to INSERT/UPDATE/DELETE on tables.
     DB-triggered, includes full row payload. Used for data sync.
  b. Broadcast -- pub/sub between clients, no DB involved. Fast
     but no persistence.
  c. Presence -- track who is online and their state. Used for
     co-presence (who is editing what).

For data sync: Postgres Changes. For co-presence: Presence.

# React Integration

  - @supabase/supabase-js is the sole client library
  - No official React hooks (unlike Liveblocks useStorage/useOthers)
  - Subscriptions managed via useEffect + cleanup via unsubscribe()
  - Works but more boilerplate than Liveblocks

# Postgres Changes Payload

  - INSERT: full new row
  - UPDATE: full new row (old row empty unless REPLICA IDENTITY FULL)
  - DELETE: only old.id by default

# Presence API

  - channel.track({ userId, ... }) to join
  - channel.on('presence', { event: 'sync' }, cb) for updates
  - channel.presenceState() returns all tracked users
  - Functional, ~1-2s latency, more manual than Liveblocks

# Pricing and Limits

  - Free tier: 500 MB database, 200 concurrent Realtime connections,
    2 million Realtime messages/month
  - Sufficient for dev + demo

# Bundle Size

  - @supabase/supabase-js 2.98.0 — includes all Supabase features
    (auth, storage, realtime, functions) in one package

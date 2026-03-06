Supabase Realtime Library Evaluation

Filled in during spike execution from docs research and testing.

# Supabase Realtime Modes

Supabase Realtime has three modes:
  a. Postgres Changes -- listen to INSERT/UPDATE/DELETE on tables
  b. Broadcast -- pub/sub between clients (no DB involved)
  c. Presence -- track who is online and their state

Need to determine which mode (or combination) fits the overwrite
model. Postgres Changes gives us DB-triggered broadcasts.
Broadcast mode is client-to-client without persistence.

# React Integration

  - @supabase/supabase-js is the client library
  - No official React hooks library (unlike Liveblocks)
  - Need to evaluate: wrap in useEffect, or use a community lib?
  - How does subscription cleanup work?

# Postgres Changes Payload

  - Does the broadcast include the full row or just changed fields?
  - Does it include the old row for updates?
  - RLS: does Realtime respect row-level security?

# Presence API

  - track() / untrack() for joining/leaving
  - presenceState() for current state
  - How does it compare to Liveblocks useOthers/useSelf?
  - Latency?

# Pricing and Limits

  - Free tier: (TBD)
  - Realtime message limits? Connection limits?
  - Sufficient for dev + demo?

# Bundle Size

  - @supabase/supabase-js: (TBD)

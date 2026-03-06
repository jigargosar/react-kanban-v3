Project Insights

# Real-Time Sync UX

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Trello's sync model (observed):
  a. All structural changes (move, label, assign) sync live
  b. Text editing does not sync while cursor is active -- commits
     on blur, last write wins
  c. Offline: warns user, does not save. Allows browsing cached
     data. Did not appear heavily polished.
  d. Full offline support is not necessary. Partial read-only
     (browse cached data) is possible but also not required.

# The Broadcast Overwrite Model

Source: [Supabase spike](spikes/supabase-realtime/insights.md)

Supabase Realtime broadcasts to all clients including the writer.
Every client applies the broadcast as an upsert — no need to
distinguish "my update vs remote update." This avoids the Firebase
problem of source-checking and reconciliation.

# Optimistic Updates

Source: [Supabase spike](spikes/supabase-realtime/insights.md)

Optimistic insert with server-generated IDs causes race conditions
(broadcast and .then callback race to provide the real ID, causing
duplicates). Solution: generate UUID client-side via
crypto.randomUUID() and pass it in the insert. Broadcast arrives
with same ID, handled as upsert — no duplicates, server wins.

For updates/deletes: apply optimistically, broadcast confirms.
For inserts: client-generated ID enables optimistic add.

# Co-Presence

Source: [Liveblocks spike](spikes/live-blocks/insights.md),
        [Supabase spike](spikes/supabase-realtime/insights.md)

No mainstream Kanban app shows when another user is editing the same
card's text. They silently lose edits via last-write-wins. Showing
co-presence turns silent data loss into visible collaboration.

Both Liveblocks and Supabase support presence. Liveblocks has
cleaner React hooks (useOthers/useSelf). Supabase is more manual
(channel.track + presenceState) but functional.

# Conflict Frequency in Kanban

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Real conflicts (two users acting on the same entity at the same
time) can happen regardless of team size. With co-presence making
concurrent edits visible, frequency may reduce but is not zero.

CRDTs provide automatic convergence for conflicts. Last-write-wins
is simpler but silently discards one user's intent. Tradeoff is
not yet decided.

# Soft Delete as Conflict Avoidance

Source: discussion during spike

Trello never hard-deletes, only archives. This eliminates:
  a. FK violations (move card to deleted column)
  b. Stale reference errors (edit deleted card)

The row always exists. Archived rows need filtering -- Postgres
view or RLS policy keeps the filter in one place rather than
scattered across client queries.

# Data Ownership

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Liveblocks stores data on their servers (Cloudflare Durable
Objects). Data persists indefinitely but we do not own or control
it. No queryable access (cannot "SELECT cards WHERE assignee =
Alice" across rooms). Webhook sync to own DB is throttled at 60s.

Supabase: we own the data in Postgres, full queryable access.

# Backend Candidates

  a. Liveblocks -- spiked. Good real-time sync and presence.
     Storage ownership is a limitation (see Data Ownership above).
  b. Convex -- not spiked. Full backend with real-time reactive
     queries, optimistic updates, database, presence, offline
     mode. Conflict model uses serializable transactions (retry,
     not merge). Newer platform. Worth keeping as an option.
  c. Supabase -- spiked. Broadcast overwrite model works. Presence
     works. Optimistic inserts solved via client-generated UUIDs.
     We own the data. More boilerplate than Liveblocks for React
     integration (no official hooks).

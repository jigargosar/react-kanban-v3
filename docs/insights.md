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

# The Firebase Problem

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Firebase-style real-time listeners force distinguishing between
local writes, remote updates, and initial load -- leading to manual
reconciliation and source-checking hacks.

Potential solution: Supabase Realtime uses a broadcast model where
all clients (including the writer) receive the same update. Every
client overwrites local state with the broadcast -- no source
checking needed.

Problem: optimistic UI still requires showing the change instantly
before the broadcast confirms or corrects it. How cleanly Supabase
supports this pattern is untested.

# Co-Presence

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

No mainstream Kanban app shows when another user is editing the same
card's text. They silently lose edits via last-write-wins. Showing
co-presence turns silent data loss into visible collaboration.

Liveblocks presence supports this natively. Supabase also has a
Realtime Presence feature -- not yet evaluated.

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

Potential solution: use Liveblocks only for presence, own all data
in our DB (Supabase).

Problem: we lose Liveblocks' optimistic UI and CRDT conflict
resolution -- need to build optimistic updates ourselves.

# Backend Candidates

Three options evaluated so far:

  a. Liveblocks -- spiked. Good real-time sync and presence.
     Storage ownership is a limitation (see Data Ownership above).
  b. Convex -- not spiked. Full backend with real-time reactive
     queries, optimistic updates, database, presence, offline
     mode. Conflict model uses serializable transactions (retry,
     not merge). Newer platform. Worth keeping as an option.
  c. Supabase -- not spiked. Battle-tested Postgres, Realtime
     broadcast, Realtime Presence, auth, serverless functions.
     Familiar territory. Optimistic UI pattern untested.

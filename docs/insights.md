Project Insights

# Real-Time Sync UX

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Three tiers of sync behavior for a multi-user Kanban board:

  a. Structural changes (move, label, assign) -- sync live,
     immediately. Standard across all production Kanban apps.
  b. Text editing -- don't sync while cursor is active. Commit on
     blur. Last write wins.
  c. Offline -- warn user, don't save. Allow browsing cached data.

# Optimistic Updates Without Source-Checking

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Firebase-style listeners force "whose update is this?" logic.
Supabase Realtime avoids this with a simpler model: all clients
subscribe, every write broadcasts to all (including the writer),
every client overwrites local state with the broadcast. No source
checking. Optimistic UI: show change instantly, broadcast confirms
or corrects.

# Co-Presence as a Differentiator

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

No mainstream Kanban app shows when another user is editing the same
card's text. They silently lose edits via last-write-wins. Showing
co-presence turns silent data loss into visible collaboration.
Liveblocks presence supports this natively.

# CRDTs Are Overkill for Kanban

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

CRDTs solve concurrent editing conflicts with mathematical
convergence. But for a Kanban board, real conflicts (two users
moving the same card simultaneously) are rare, and last-write-wins
is acceptable. CRDTs add complexity (tombstones, opaque binary
storage, no queryable data) without proportional benefit.

Co-presence reduces conflicts further by making concurrent edits
visible before they happen.

# Soft Delete Eliminates Multi-User Conflicts

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Never hard-delete, only archive. This eliminates FK violations
(move card to deleted column) and stale reference errors (edit
deleted card). The row always exists. Filter archived rows via
Postgres view or RLS policy -- single source of truth for the
filter, not scattered across client queries.

# Architecture Direction

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

  a. Supabase -- source of truth, persistence, auth, real-time
     broadcast, serverless functions
  b. Liveblocks -- presence layer only (who is online, co-editing
     awareness). Skip Liveblocks Storage.
  c. Optimistic updates -- client-side, confirmed or corrected by
     Supabase Realtime broadcast
  d. Conflicts -- last-write-wins, acceptable for Kanban
  e. Deletion -- archive only, never hard delete

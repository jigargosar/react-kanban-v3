Spike Insights

# Results

Sync and presence work as advertised:
  a. Two-tab sync is instant, no flicker, no manual reconciliation
  b. Presence (useOthers/useSelf) updates within 1-2 seconds
  c. LiveList operations (push, delete, move) apply optimistically
     and converge across clients automatically
  d. TypeScript support is solid -- global Liveblocks interface
     declaration gives typed hooks throughout

CRDT storage model:
  a. LiveObject, LiveList, LiveMap all available
  b. LiveList handles concurrent add/remove/move with automatic
     conflict resolution
  c. LiveMap with fractional indexing keys is likely the right model
     for Kanban cards (flat map, sort by position per column)
  d. Initial storage set via initialStorage prop on RoomProvider,
     only applied when room is first created
  e. State can be seeded externally via REST API

# Three Tiers of Sync Behavior

From Trello analysis and spike experimentation:

  a. Structural changes (move card, add label, assign, cross-column
     drag) -- sync immediately, live. Every production Kanban app
     does this. CRDTs give us better conflict handling than server-
     side last-write-wins.

  b. Text editing -- while cursor is in the field, don't sync. On
     blur, commit. Last write wins. This is Trello's model.

  c. Offline -- Trello warns "changes won't be saved" and allows
     browsing cached data. No offline write support. Liveblocks
     also has no native offline mode. Acceptable baseline: warn
     the user, don't pretend offline works.

# Co-Presence as a USP

Trello silently loses text edits on conflict (last write wins).
We can do better: when a user opens a card's text editor, show
if another user is also editing it. This turns silent data loss
into visible collaboration -- the user knows to wait or coordinate.

Liveblocks presence (useOthers with scoped state) supports this
natively. This is a differentiator no mainstream Kanban app offers.

# Optimistic UI -- Lessons from Firebase

The core problem with Firebase-style real-time listeners:
  a. Can't distinguish local writes from remote updates from
     initial load
  b. Have to build manual optimistic update logic on top
  c. Leads to source-checking hacks and flicker

Liveblocks CRDTs avoid this entirely -- there is no distinction
between local and remote state. Mutations apply locally first,
converge automatically. No reconciliation code needed.

# Gotchas

  a. Free tier shows "Powered by Liveblocks" watermark
  b. Without global type declaration (declare global interface
     Liveblocks), hooks return untyped Lson unions -- must set up
     liveblocks.config.ts early
  c. Pricing/limits still need evaluation for production use

# Decision

Adopt. Liveblocks delivers on its core promise:
  - Optimistic UI without manual reconciliation
  - No "whose update is this?" disambiguation (the Firebase problem)
  - CRDT convergence is automatic and deterministic
  - Presence is built in and enables co-editing awareness (USP)

Pair with Supabase for persistence, auth, and serverless functions.

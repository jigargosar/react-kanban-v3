Spike Findings

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

# UX Pattern (from Trello analysis)

Trello's model is simple and proven:
  a. Everything syncs immediately -- moves, labels, assignees,
     column changes, cross-board drags
  b. One exception: text editing. While cursor is in the field,
     no sync. On blur, commit. Last write wins.
  c. No deferred rendering, no queuing, no complex state management

This is our target behavior. Liveblocks supports it naturally:
  - LiveList/LiveMap handle immediate sync for structural changes
  - Text fields: don't bind to storage until blur

The "layout shift" concern was overblown -- every production Kanban
app (Trello, Linear) applies changes live. CRDTs give us better
conflict handling than last-write-wins from a server.

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
  - Presence is built in

Pair with Supabase for persistence, auth, and serverless functions.

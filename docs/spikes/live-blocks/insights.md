Spike Insights

# Observations

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

# CRDT Internals

Not a pure CRDT -- centralized server (Cloudflare Durable Objects)
with CRDT-inspired client-side structures. Server is authoritative.

Mutation flow:
  a. Local optimistic apply (instant UI)
  b. Send op to server via WebSocket
  c. Server applies, persists, acknowledges back to sender
  d. Server broadcasts to other clients
  e. While local op is pending, conflicting remote ops are ignored
     locally (prevents flicker)

Conflict resolution per type:
  a. LiveObject/LiveMap -- last-write-wins per property/key
  b. LiveList -- ID-based operations internally (not positional).
     Concurrent ops on different items never conflict.

Storage persists indefinitely on Liveblocks servers. No server-side
operations log (confirmed by team). Client-side undo/redo only,
resets on page reload.

# Integration Limitations

  a. StorageUpdated webhook throttled to once per 60 seconds --
     not per-operation, just a "something changed" signal
  b. No PATCH API -- server-side write-back reinitializes storage
     and disconnects all users
  c. Client-side room.subscribe(root, cb, { isDeep: true }) gives
     per-operation visibility, but only on the client
  d. Liveblocks expects to BE your database during collaboration.
     Your DB is a secondary, eventually-consistent read-copy.
  e. No case studies detail how production apps pair Liveblocks
     with their own database

# Presence

  a. useOthers / useSelf hooks are clean and ergonomic
  b. Scoped presence state (e.g., isDragging, editingCardId)
  c. 1-2 second update latency is good enough

# Gotchas

  a. Free tier shows "Powered by Liveblocks" watermark
  b. Without global type declaration, hooks return untyped Lson
     unions -- must set up liveblocks.config.ts early
  c. Pricing: 100 MAU, 10 connections/room, 256MB storage on free
  d. Open-sourced sync engine (@liveblocks/server, AGPL v3) with
     per-room SQLite -- self-hosting may be possible

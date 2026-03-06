Liveblocks Library Evaluation

Filled in during spike execution from docs research and hands-on testing.

# Pricing and Limits

- Free tier: (TBD -- check current limits for MAU, connections, storage)
- Paid tiers: (TBD)
- Sufficient for dev + demo use? (TBD)

# React SDK API Surface

Packages: @liveblocks/client, @liveblocks/react (import from /suspense)

Key hooks confirmed from docs:
  a. useStorage -- read CRDT state via selector: useStorage((root) => root.todos)
  b. useMutation -- write CRDT state: useMutation(({ storage }, args) => ...)
  c. useOthers -- presence (who is connected, their state)
  d. useSelf -- current user presence
  e. useUpdateMyPresence -- update own presence (e.g., isTyping, isDragging)
  f. useHistory -- undo/redo

Provider setup:
  LiveblocksProvider > RoomProvider > ClientSideSuspense > App

# CRDT Storage Model

Available types:
  a. LiveObject -- like JS object, last-write-wins per property
  b. LiveList -- ordered collection, resolves concurrent add/remove/move
  c. LiveMap -- like JS Map, last-write-wins per key

Initial state: set via initialStorage prop on RoomProvider, only used when
room is first created. Subsequent renders ignore it.

For Kanban with fractional indexing:
  - Option A: LiveMap keyed by cardId, each value a LiveObject with
    { position, columnId, title, ... } -- fractional index in position field
  - Option B: LiveList per column -- but then reordering across columns
    means removing from one LiveList and adding to another
  - Option A is likely cleaner -- single flat map, sort by position per column
  - (needs spike validation)

State can be seeded from external source via REST API:
  POST /v2/rooms/{roomId}/storage (reinitializes, disconnects all users)

# Mutation Observability

- Webhook support for server-side event capture? (TBD)
- Relevant for eventual journal/DB sync layer

# Bundle Size

- @liveblocks/client: (TBD -- check bundlephobia during setup)
- @liveblocks/react: (TBD)

# Lock-In Risk

- App code directly uses LiveObject/LiveList/LiveMap -- moderate coupling
- Could we swap to another CRDT lib (Yjs, Automerge) later? (TBD)
- Data export via REST API exists (GET /v2/rooms/{roomId}/storage)

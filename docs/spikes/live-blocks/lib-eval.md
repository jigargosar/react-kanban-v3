Liveblocks Library Evaluation

Filled in during spike execution from docs research and hands-on testing.

# Pricing and Limits

- Free tier: (TBD -- check current limits for MAU, connections, storage)
- Paid tiers: (TBD)
- Sufficient for dev + demo use? (TBD)

# React SDK API Surface

- Key hooks to evaluate:
  a. useStorage -- read CRDT state
  b. useMutation -- write CRDT state
  c. useOthers -- presence (who is connected, their state)
  d. useSelf -- current user presence
  e. useHistory -- undo/redo

# CRDT Storage Model

- Available types: LiveObject, LiveList, LiveMap
- Can LiveList hold items with fractional index strings? (TBD)
- Or must we use LiveMap with fractional keys? (TBD)
- How is initial/default room state defined? (TBD)
- Can state be seeded from an external source? (TBD)

# Mutation Observability

- Can we intercept mutations for future persistence? (TBD)
- Webhook support for server-side event capture? (TBD)
- Relevant for eventual journal/DB sync layer

# Bundle Size

- @liveblocks/client: (TBD)
- @liveblocks/react: (TBD)

# Lock-In Risk

- How coupled is app code to Liveblocks primitives? (TBD)
- Could we swap to another CRDT lib (Yjs, Automerge) later? (TBD)
- Data export options? (TBD)

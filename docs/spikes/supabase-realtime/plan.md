Spike Execution Plan

# Step 1 -- Setup

  - Create Supabase project, get project URL + anon key
  - Install @supabase/supabase-js
  - Create a simple items table:
      id        uuid primary key default gen_random_uuid()
      text      text not null
      position  text not null
      created   timestamptz default now()
  - Enable Realtime on the table

# Step 2 -- Realtime Broadcast (Overwrite Model)

  - Subscribe to Postgres changes on items table
  - Two browser tabs: insert/update in one, confirm both receive
  - Verify the writer also receives their own change
  - On every broadcast, overwrite local state from payload
  - Observe: any flicker? any source-checking needed?

# Step 3 -- Optimistic Updates

  - On user action, update local state immediately (optimistic)
  - Send mutation to Supabase
  - When broadcast arrives, overwrite local state
  - Test: does the optimistic state match the broadcast? If yes,
    no visible change. If no (conflict), the UI corrects.
  - Test: what happens on error (e.g., network failure)? Does the
    optimistic state revert?

# Step 4 -- Presence

  - Use Supabase Realtime Presence (track/untrack)
  - Show connected users
  - Track per-user state (e.g., editingItemId)
  - Compare ergonomics with Liveblocks useOthers/useSelf

# Step 5 -- Latency

  - Measure time from write to broadcast arrival on second tab
  - Acceptable: under 500ms for structural changes

# Checkpoints

+-----+============================+=========================+
| #   | Check                      | Pass Condition          |
+-----+============================+=========================+
| 1   | Broadcast includes writer  | No source-checking      |
+-----+----------------------------+-------------------------+
| 2   | Optimistic + broadcast     | No flicker              |
+-----+----------------------------+-------------------------+
| 3   | Presence                   | Shows within 1-2s       |
+-----+----------------------------+-------------------------+
| 4   | Latency                    | Under 500ms             |
+-----+----------------------------+-------------------------+
| 5   | Error handling             | Optimistic reverts on   |
|     |                            | failure                 |
+-----+----------------------------+-------------------------+

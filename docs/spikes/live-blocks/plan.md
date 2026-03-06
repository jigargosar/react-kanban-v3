Spike Execution Plan

# Step 1 -- Setup

- Create Liveblocks account, get API key
- Install @liveblocks/client and @liveblocks/react
- Configure Liveblocks client in spike source

# Step 2 -- Single Room, Reorderable List

- One React page with a list of ~6 items
- Use Liveblocks LiveList (or LiveMap) for shared state
- Reorder items via buttons or basic drag
- Open two browser tabs, confirm sync

# Step 3 -- Presence

- Show connected users using useOthers hook
- Display "User X is dragging Item Y" indicator
- Verify presence updates within 1-2 seconds

# Step 4 -- Conflict Test

- Both tabs drag the same item simultaneously
- Observe: does it converge? any data loss? any flicker?

# Step 5 -- Storage Model Check

- Can we use fractional indexing strings as position keys
  inside Liveblocks storage?
- Or does LiveList impose its own ordering that conflicts?

# Checkpoints

+-----+============================+=========================+
| #   | Check                      | Pass Condition          |
+-----+============================+=========================+
| 1   | Two-tab sync               | Instant, no flicker     |
+-----+----------------------------+-------------------------+
| 2   | Conflict resolution        | Deterministic merge,    |
|     |                            | no data loss            |
+-----+----------------------------+-------------------------+
| 3   | Presence                   | Shows within 1-2s       |
+-----+----------------------------+-------------------------+
| 4   | Fractional indexing compat | Works inside storage    |
+-----+----------------------------+-------------------------+
| 5   | API ergonomics             | Clean hooks, no hacks   |
+-----+----------------------------+-------------------------+

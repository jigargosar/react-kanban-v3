Spike: Liveblocks for Real-Time Collaborative Kanban

# Purpose

Validate whether Liveblocks is the right real-time collaboration layer for a
multi-user Kanban board. The core promise: CRDT-based sync that gives optimistic
UI for free, with no manual reconciliation of local vs remote state (the problem
that plagues Firebase-style listeners).

# What We Are Validating

1. CRDT sync -- mutations apply locally first, converge automatically across
   clients, no rollbacks
2. Optimistic UI -- drag/reorder feels instant with zero flicker, no
   "whose update is this?" disambiguation
3. Presence -- show who is online, who is viewing/dragging what
4. Conflict resolution -- two users drag the same card simultaneously and
   the result is deterministic and sensible

# Success Criteria

- Two browser tabs in the same room, reorder a list item in one, it appears
  instantly in both without flicker or rollback
- Simultaneous conflicting drags resolve cleanly (no data loss, no crash)
- Presence updates show/hide users within 1-2 seconds
- API is clean enough that we are not fighting the abstraction

# Failure Criteria

- Requires manual diffing or reconciliation between local and remote state
- CRDT storage model cannot represent ordered lists with fractional indexing
- Optimistic UI requires workarounds (debounce, skip logic, source checking)
- Free tier too restrictive for development and demo use

# Folder Guide

- This folder (docs/spikes/live-blocks/) -- spike planning, library
  evaluation, and findings
- src/ subfolder (created during execution) -- throwaway spike code,
  served by Vite from project root

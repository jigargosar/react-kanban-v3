Spike: Supabase Realtime for Multi-User Kanban

# Purpose

Validate whether Supabase Realtime can serve as the sync layer for
a multi-user Kanban board. Specifically: the broadcast/overwrite
model where all clients (including the writer) subscribe and
overwrite local state on every broadcast -- eliminating the need
to distinguish "my update vs remote update."

# What We Are Validating

  a. Realtime broadcast -- subscribe to table changes, all clients
     receive updates including the writer
  b. Optimistic updates -- show change instantly, broadcast confirms
     or corrects. No flicker, no source-checking.
  c. Presence -- who is online, who is editing what card. Evaluate
     Supabase Realtime Presence as alternative to Liveblocks.
  d. Latency -- how fast do changes propagate to other clients?

# Success Criteria

  - Two browser tabs subscribed to the same table. Insert/update
    in one, both receive the broadcast without source-checking.
  - Optimistic UI feels instant. Broadcast arrival does not cause
    flicker or rollback in the common case.
  - Presence updates show/hide users within 1-2 seconds.
  - No Firebase-style "whose update is this?" problem.

# Failure Criteria

  - Broadcast does not include the writer's own changes (forcing
    source-checking)
  - Optimistic update and broadcast fight each other (flicker)
  - Presence is too slow or too limited for co-editing awareness
  - Realtime subscription setup is overly complex

# Folder Guide

  - This folder (docs/spikes/supabase-realtime/) -- spike planning,
    evaluation, and insights
  - src/ subfolder (created during execution) -- throwaway spike
    code, served by Vite from project root

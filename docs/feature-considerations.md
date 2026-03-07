Feature Considerations

Features under consideration for the Kanban board. Not a backlog —
these are ideas to evaluate, not commitments.

# Authentication & Multi-user

1. User auth (Supabase Auth — email/magic link)
2. Board sharing with invite links
3. Per-board roles (owner, editor, viewer)
4. Card assignment to board members
5. @mentions in comments with notifications

# Card Power

1. Checklists/subtasks within cards (with progress bar on card face)
2. Markdown rendering in descriptions and comments
3. File/image attachments (Supabase Storage)
4. Card templates (save as template, stamp new cards from it)
5. Activity log per card (who changed what, when)

# Views & Filtering

1. Multi-criteria filter (label + due date + assignee)
2. Calendar view (cards plotted by due date)
3. List/table view (spreadsheet-style, sortable columns)
4. Saved filters/views per board

# Board Organization

1. Workspaces (group boards by project/team)
2. Board backgrounds/themes
3. Archive view (browse and restore archived cards/columns)
4. Board duplication

# Collaboration Polish

1. Live cursors or "editing" indicators on cards
2. Typing indicator in comments
3. Conflict resolution UI (show when two users edited same field)

# Keyboard & Power User

1. Keyboard shortcuts (n=new card, e=edit, l=labels, arrows=navigate)
2. Undo/redo (command history)
3. Bulk select + bulk actions (move, label, archive)
4. Drag to reorder multiple cards at once

# Technical Foundation

1. Mutation queue (tracked in Board.md)
2. Offline mode (queue writes, sync on reconnect)
3. Pagination/virtualization for large boards
4. Accessibility (keyboard nav, ARIA, screen reader)

# Portfolio Impact Notes

Strong vertical picks for showcasing skill:
  a. Auth + assignment + checklists — full-stack competence
  b. Keyboard shortcuts + undo/redo — engineering depth
  c. Calendar view — visually impressive, data modeling skill

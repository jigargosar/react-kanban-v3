Task Board

# Urgent

# InBasket

# Ready [RTI]

1. Seed clean demo board with realistic content
2. Deploy to Netlify + README with screenshot and live link

# InProgress

1. Fix due date timezone bug (UTC midnight shows wrong day in negative UTC offsets, false overdue)
2. Fix Escape key propagation in CardDetailModal/QuickEditPopup (closes modal when editing sub-inputs)
3. Fix comments loading race condition (switching cards rapidly shows wrong/no comments)
4. Clean up checklist_items/comments state on card archive
6. Clean up card_labels/comments/checklist_items state on column archive
7. Add missing DB indexes (cards.column_id, card_labels.label_id, checklist_items.card_id)
8. Refactor: extract useBoardData hook from BoardView, shared realtime handler, shared LabelPicker, COVER_COLORS redundancy, export domain types, memoization consistency

# Review

1. Label renaming (edit pencil on label bars)
2. Keyboard shortcuts (n=new card, e=edit, l=labels, ?=help)
3. Mutation queue for Supabase writes
4. Label pills on cards: show label name on hover
5. Column drag: full column overlay, local reorder, translucent preview
6. Checklists/subtasks with progress bar on card face

# Done

1. Fix mutation queue crash (try/catch so failed mutations don't freeze queue)
2. Fix column drag position (use active column's neighbors in reordered array)
3. Scope realtime subscriptions (guard cards/card_labels/comments/checklist_items against other boards)
4. Remove unused @liveblocks dependencies
5. Labels: Trello-style colored bars, default labels seeded per board
6. Refactor App.tsx: extract useBoards hook, separate data fetch from auto-creation, extract seedDefaultLabels
7. Fix seed default labels for initial auto-created board (first-time users get empty label picker)
8. Remove dead orphan column adoption code

# Backlog

1. User auth (Supabase Auth)
2. RLS policies tied to auth (replace open anon policies)
3. Board sharing and invite links
4. Archive view (browse and restore archived cards/columns)
6. UI: overhaul
7. Board backgrounds/themes
8. Markdown in descriptions/comments

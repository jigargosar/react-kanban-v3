Project Insights

# Real-Time Sync UX

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Three tiers of sync behavior for a multi-user Kanban board:

  a. Structural changes (move, label, assign) -- sync live,
     immediately. This is standard across all production Kanban apps.
  b. Text editing -- don't sync while cursor is active. Commit on
     blur. Last write wins.
  c. Offline -- warn user, don't save. Allow browsing cached data.

# Optimistic Updates

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

Firebase-style real-time listeners force you to distinguish between
local writes, remote updates, and initial load -- leading to manual
reconciliation and source-checking hacks. CRDTs (Liveblocks) avoid
this entirely: mutations apply locally first, converge automatically.

# Co-Presence as a Differentiator

Source: [Liveblocks spike](spikes/live-blocks/insights.md)

No mainstream Kanban app shows when another user is editing the same
card's text. They silently lose edits via last-write-wins. Showing
co-presence in the text editor turns silent data loss into visible
collaboration. Liveblocks presence supports this natively.

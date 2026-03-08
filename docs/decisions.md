Design Decisions

# Mutation Queue

All Supabase writes go through a serial FIFO queue.
Optimistic state updates stay synchronous — queue only affects DB writes.

Problem: fire-and-forget writes execute in unpredictable order.
No guarantee that write A completes before write B starts.

Implementation: mutationQueue.ts exports enqueue(fn). ~15 lines.
All writes in App.tsx and BoardView.tsx go through enqueue(). Fully implemented.

Open: how to make bypassing the queue impossible, not just convention.

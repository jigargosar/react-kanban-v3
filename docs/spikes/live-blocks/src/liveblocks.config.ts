import type { LiveList } from '@liveblocks/client'

declare global {
    interface Liveblocks {
        Presence: {
            isDragging: string | null
        }
        Storage: {
            items: LiveList<string>
        }
    }
}

export {}

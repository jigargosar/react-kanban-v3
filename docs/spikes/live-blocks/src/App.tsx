import { LiveList } from '@liveblocks/client'
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from '@liveblocks/react/suspense'
import { ReorderList } from './ReorderList'
import { Presence } from './Presence'

const LIVEBLOCKS_KEY = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string

const INITIAL_ITEMS = new LiveList([
    'Backlog grooming',
    'Design review',
    'API integration',
    'Write tests',
    'Deploy to staging',
    'Demo to team',
])

export function App() {
    return (
        <LiveblocksProvider publicApiKey={LIVEBLOCKS_KEY}>
            <RoomProvider
                id="spike-reorder-room"
                initialPresence={{ isDragging: null as string | null }}
                initialStorage={{ items: INITIAL_ITEMS }}
            >
                <ClientSideSuspense
                    fallback={
                        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
                            Connecting...
                        </div>
                    }
                >
                    <div className="min-h-screen bg-gray-950 p-8">
                        <h1 className="text-2xl font-bold text-white mb-6">
                            Liveblocks Spike — Reorder List
                        </h1>
                        <Presence />
                        <ReorderList />
                    </div>
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    )
}

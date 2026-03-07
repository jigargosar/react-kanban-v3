import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type PresenceState = { userId: string }

export function Presence() {
    const [myId] = useState(() => crypto.randomUUID().slice(0, 8))
    const [others, setOthers] = useState<PresenceState[]>([])

    useEffect(() => {
        const channel = supabase.channel('kanban-presence')

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState<PresenceState>()
                const all = Object.values(state).flat()
                setOthers(all.filter((p) => p.userId !== myId))
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ userId: myId })
                }
            })

        return () => { channel.unsubscribe() }
    }, [myId])

    const totalUsers = others.length + 1

    return (
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex -space-x-2">
                <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white ring-2 ring-gray-950">
                    {myId.slice(0, 2).toUpperCase()}
                </div>
                {others.map((o) => (
                    <div
                        key={o.userId}
                        className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white ring-2 ring-gray-950"
                    >
                        {o.userId.slice(0, 2).toUpperCase()}
                    </div>
                ))}
            </div>
            <span>{totalUsers} online</span>
        </div>
    )
}

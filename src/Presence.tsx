import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type PresenceState = { userId: string }

const AVATAR_COLORS = [
    'bg-teal-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-sky-500',
    'bg-lime-500',
]

function avatarColor(index: number) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

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

    return (
        <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
                <div
                    className="relative h-7 w-7 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-semibold text-white ring-2 ring-surface"
                    title={`You (${myId})`}
                >
                    <span className="absolute inset-0 rounded-full animate-pulse-ring" />
                    {myId.slice(0, 2).toUpperCase()}
                </div>
                {others.map((o, i) => (
                    <div
                        key={o.userId}
                        className={`h-7 w-7 rounded-full ${avatarColor(i + 1)} flex items-center justify-center text-[10px] font-semibold text-white ring-2 ring-surface`}
                        title={o.userId}
                    >
                        {o.userId.slice(0, 2).toUpperCase()}
                    </div>
                ))}
            </div>
            <span className="text-xs text-white/30 font-medium">
                {others.length + 1} online
            </span>
        </div>
    )
}

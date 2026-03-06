import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type PresenceState = { userId: string }

export function Presence() {
    const [myId] = useState(() => crypto.randomUUID().slice(0, 8))
    const [others, setOthers] = useState<PresenceState[]>([])

    useEffect(() => {
        const channel = supabase.channel('spike-presence')

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
        <div className="mb-6 text-sm text-gray-400">
            <p>You: {myId}</p>
            <p>
                {others.length === 0
                    ? 'No one else is here'
                    : `${others.length} other${others.length > 1 ? 's' : ''} connected: ${others.map((o) => o.userId).join(', ')}`}
            </p>
        </div>
    )
}

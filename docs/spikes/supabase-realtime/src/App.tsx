import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { ReorderList } from './ReorderList'
import { Presence } from './Presence'

type Item = { id: string; text: string; position: string }

export function App() {
    const [items, setItems] = useState<Item[]>([])
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

    useEffect(() => {
        supabase
            .from('spike_items')
            .select('*')
            .order('position')
            .then(({ data, error }) => {
                if (error) {
                    setStatus('error')
                    return
                }
                setItems(data ?? [])
                setStatus('connected')
            })

        const channel = supabase
            .channel('spike-items')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'spike_items' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setItems((prev) => [...prev, payload.new as Item].sort((a, b) => a.position < b.position ? -1 : 1))
                    } else if (payload.eventType === 'UPDATE') {
                        setItems((prev) =>
                            prev.map((item) => item.id === (payload.new as Item).id ? payload.new as Item : item)
                                .sort((a, b) => a.position < b.position ? -1 : 1)
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setItems((prev) => prev.filter((item) => item.id !== payload.old.id))
                    }
                },
            )
            .subscribe()

        return () => { channel.unsubscribe() }
    }, [])

    if (status === 'connecting') {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
                Connecting...
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">
                Failed to connect to Supabase
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <h1 className="text-2xl font-bold text-white mb-6">
                Supabase Realtime Spike — Reorder List
            </h1>
            <Presence />
            <ReorderList items={items} setItems={setItems} />
        </div>
    )
}

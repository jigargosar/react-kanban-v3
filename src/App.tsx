import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Board } from './Board'
import { Presence } from './Presence'
import type { Column, Card } from './types'

export function App() {
    const [columns, setColumns] = useState<Column[]>([])
    const [cards, setCards] = useState<Card[]>([])
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

    useEffect(() => {
        Promise.all([
            supabase.from('columns').select('*').eq('archived', false).order('position'),
            supabase.from('cards').select('*').eq('archived', false).order('position'),
        ]).then(([columnsRes, cardsRes]) => {
            if (columnsRes.error || cardsRes.error) {
                setStatus('error')
                return
            }
            setColumns(columnsRes.data ?? [])
            setCards(cardsRes.data ?? [])
            setStatus('connected')
        })

        const channel = supabase
            .channel('kanban')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'columns' },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setColumns((prev) => prev.filter((c) => c.id !== payload.old.id))
                        return
                    }
                    const col = payload.new as Column
                    setColumns((prev) => {
                        if (col.archived) return prev.filter((c) => c.id !== col.id)
                        const exists = prev.some((c) => c.id === col.id)
                        const next = exists
                            ? prev.map((c) => c.id === col.id ? col : c)
                            : [...prev, col]
                        return next.sort((a, b) => a.position < b.position ? -1 : 1)
                    })
                },
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cards' },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setCards((prev) => prev.filter((c) => c.id !== payload.old.id))
                        return
                    }
                    const card = payload.new as Card
                    setCards((prev) => {
                        if (card.archived) return prev.filter((c) => c.id !== card.id)
                        const exists = prev.some((c) => c.id === card.id)
                        const next = exists
                            ? prev.map((c) => c.id === card.id ? card : c)
                            : [...prev, card]
                        return next.sort((a, b) => a.position < b.position ? -1 : 1)
                    })
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
                Failed to connect
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <header className="flex items-center justify-between pb-6">
                <h1 className="text-xl font-semibold text-white">Kanban Board</h1>
                <Presence />
            </header>
            <Board
                columns={columns}
                cards={cards}
                setColumns={setColumns}
                setCards={setCards}
            />
        </div>
    )
}

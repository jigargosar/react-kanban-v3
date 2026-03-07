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
            <div className="min-h-screen dot-grid flex flex-col items-center justify-center gap-4">
                <div className="h-8 w-48 rounded-lg animate-shimmer" />
                <p className="text-sm text-white/30">Connecting to board...</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen dot-grid flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <p className="text-sm text-red-400/80">Failed to connect</p>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden dot-grid flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <h1 className="text-base font-semibold text-white tracking-tight">Kanban</h1>
                    <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-ping opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                        <span className="text-[11px] font-medium text-accent">LIVE</span>
                    </div>
                </div>
                <Presence />
            </header>
            <div className="flex-1 p-6 overflow-hidden">
                <Board
                    columns={columns}
                    cards={cards}
                    setColumns={setColumns}
                    setCards={setCards}
                />
            </div>
        </div>
    )
}

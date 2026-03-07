import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { generateKeyBetween } from 'fractional-indexing'
import { Board } from './Board'
import { Presence } from './Presence'
import { CardDetailModal } from './CardDetailModal'
import type { Column, Card } from './types'

type BoardViewProps = {
    boardId: string
}

export function BoardView({ boardId }: BoardViewProps) {
    const [columns, setColumns] = useState<Column[]>([])
    const [cards, setCards] = useState<Card[]>([])
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

    const selectedCard = selectedCardId ? cards.find((c) => c.id === selectedCardId) ?? null : null

    useEffect(() => {
        supabase.from('columns').select('*').eq('board_id', boardId).eq('archived', false).order('position')
            .then(({ data: cols, error: colErr }) => {
                if (colErr) { setStatus('error'); return }
                const columnData = cols ?? []
                setColumns(columnData)
                const columnIds = columnData.map((c) => c.id)
                if (columnIds.length === 0) {
                    setCards([])
                    setStatus('ready')
                    return
                }
                supabase.from('cards').select('*').in('column_id', columnIds).eq('archived', false).order('position')
                    .then(({ data: cardData, error: cardErr }) => {
                        if (cardErr) { setStatus('error'); return }
                        setCards(cardData ?? [])
                        setStatus('ready')
                    })
            })

        const channel = supabase
            .channel(`board-${boardId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` },
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
    }, [boardId])

    const cardsForColumn = (columnId: string) =>
        cards
            .filter((c) => c.column_id === columnId)
            .sort((a, b) => a.position < b.position ? -1 : 1)

    const addColumn = () => {
        const lastPosition = columns[columns.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        const title = `Column ${columns.length + 1}`
        setColumns((prev) => [...prev, { id, board_id: boardId, title, position, archived: false }])
        supabase.from('columns').insert({ id, board_id: boardId, title, position })
            .then(({ error }) => { if (error) console.error(error) })
    }

    const addCard = (columnId: string, title: string) => {
        const columnCards = cardsForColumn(columnId)
        const lastPosition = columnCards[columnCards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        setCards((prev) => [...prev, { id, column_id: columnId, title, description: '', position, archived: false }])
        supabase.from('cards').insert({ id, column_id: columnId, title, position })
            .then(({ error }) => { if (error) console.error(error) })
    }

    const archiveCard = (cardId: string) => {
        setCards((prev) => prev.filter((c) => c.id !== cardId))
        if (selectedCardId === cardId) setSelectedCardId(null)
        supabase.from('cards').update({ archived: true }).eq('id', cardId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const archiveColumn = (columnId: string) => {
        setColumns((prev) => prev.filter((c) => c.id !== columnId))
        setCards((prev) => prev.filter((c) => c.column_id !== columnId))
        supabase.from('columns').update({ archived: true }).eq('id', columnId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const updateCardTitle = (cardId: string, title: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, title } : c))
        supabase.from('cards').update({ title }).eq('id', cardId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const updateCardDescription = (cardId: string, description: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, description } : c))
        supabase.from('cards').update({ description }).eq('id', cardId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const updateColumnTitle = (columnId: string, title: string) => {
        setColumns((prev) => prev.map((c) => c.id === columnId ? { ...c, title } : c))
        supabase.from('columns').update({ title }).eq('id', columnId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const moveCard = (cardId: string, targetColumnId: string, position: string) => {
        setCards((prev) =>
            prev.map((c) => c.id === cardId ? { ...c, column_id: targetColumnId, position } : c)
                .sort((a, b) => a.position < b.position ? -1 : 1)
        )
        supabase.from('cards').update({ column_id: targetColumnId, position }).eq('id', cardId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const moveCardToColumn = (cardId: string, targetColumnId: string) => {
        const targetCards = cardsForColumn(targetColumnId)
        const lastPosition = targetCards[targetCards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        moveCard(cardId, targetColumnId, position)
    }

    const moveCardLocally = (cardId: string, columnId: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, column_id: columnId } : c))
    }

    if (status === 'loading') {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="h-6 w-36 rounded-lg animate-shimmer" />
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex-1 flex items-center justify-center text-red-400/80 text-sm">
                Failed to load board
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
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
                    cardsForColumn={cardsForColumn}
                    onAddColumn={addColumn}
                    onAddCard={addCard}
                    onArchiveCard={archiveCard}
                    onArchiveColumn={archiveColumn}
                    onUpdateCardTitle={updateCardTitle}
                    onUpdateColumnTitle={updateColumnTitle}
                    onMoveCard={moveCard}
                    onMoveCardLocally={moveCardLocally}
                    onCardClick={setSelectedCardId}
                />
            </div>
            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    columns={columns}
                    onUpdateTitle={(title) => updateCardTitle(selectedCard.id, title)}
                    onUpdateDescription={(desc) => updateCardDescription(selectedCard.id, desc)}
                    onMoveToColumn={(columnId) => moveCardToColumn(selectedCard.id, columnId)}
                    onArchive={() => archiveCard(selectedCard.id)}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </div>
    )
}

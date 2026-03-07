import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { generateKeyBetween } from 'fractional-indexing'
import { Board } from './Board'
import { Presence } from './Presence'
import { CardDetailModal } from './CardDetailModal'
import { QuickEditPopup } from './QuickEditPopup'
import type { Column, Card, Label, CardLabel } from './types'

type BoardViewProps = {
    boardId: string
}

export function BoardView({ boardId }: BoardViewProps) {
    const [columns, setColumns] = useState<Column[]>([])
    const [cards, setCards] = useState<Card[]>([])
    const [labels, setLabels] = useState<Label[]>([])
    const [cardLabels, setCardLabels] = useState<CardLabel[]>([])
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
    const [quickEditState, setQuickEditState] = useState<{ cardId: string; rect: DOMRect } | null>(null)

    const selectedCard = selectedCardId ? cards.find((c) => c.id === selectedCardId) ?? null : null

    useEffect(() => {
        const loadData = async () => {
            const { data: cols, error: colErr } = await supabase
                .from('columns').select('*').eq('board_id', boardId).eq('archived', false).order('position')

            if (colErr) { setStatus('error'); return }
            const columnData = cols ?? []
            setColumns(columnData)

            const columnIds = columnData.map((c) => c.id)

            const [cardsRes, labelsRes] = await Promise.all([
                columnIds.length > 0
                    ? supabase.from('cards').select('*').in('column_id', columnIds).eq('archived', false).order('position')
                    : Promise.resolve({ data: [] as Card[], error: null }),
                supabase.from('labels').select('*').eq('board_id', boardId).order('position'),
            ])

            if (cardsRes.error || labelsRes.error) { setStatus('error'); return }
            const cardData = cardsRes.data ?? []
            setCards(cardData)
            setLabels(labelsRes.data ?? [])

            if (cardData.length > 0) {
                const cardIds = cardData.map((c) => c.id)
                const { data: clData } = await supabase
                    .from('card_labels').select('*').in('card_id', cardIds)
                setCardLabels(clData ?? [])
            }

            setStatus('ready')
        }

        loadData()

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
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'labels', filter: `board_id=eq.${boardId}` },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setLabels((prev) => prev.filter((l) => l.id !== payload.old.id))
                        setCardLabels((prev) => prev.filter((cl) => cl.label_id !== payload.old.id))
                        return
                    }
                    const label = payload.new as Label
                    setLabels((prev) => {
                        const exists = prev.some((l) => l.id === label.id)
                        const next = exists
                            ? prev.map((l) => l.id === label.id ? label : l)
                            : [...prev, label]
                        return next.sort((a, b) => a.position < b.position ? -1 : 1)
                    })
                },
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'card_labels' },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        const old = payload.old as CardLabel
                        setCardLabels((prev) =>
                            prev.filter((cl) => !(cl.card_id === old.card_id && cl.label_id === old.label_id))
                        )
                        return
                    }
                    const cl = payload.new as CardLabel
                    setCardLabels((prev) => {
                        const exists = prev.some((x) => x.card_id === cl.card_id && x.label_id === cl.label_id)
                        return exists ? prev : [...prev, cl]
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

    const labelsForCard = (cardId: string): Label[] => {
        const labelIds = cardLabels.filter((cl) => cl.card_id === cardId).map((cl) => cl.label_id)
        return labels.filter((l) => labelIds.includes(l.id))
    }

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
        setCards((prev) => [...prev, { id, column_id: columnId, title, description: '', position, archived: false, due_date: null }])
        supabase.from('cards').insert({ id, column_id: columnId, title, position })
            .then(({ error }) => { if (error) console.error(error) })
    }

    const archiveCard = (cardId: string) => {
        setCards((prev) => prev.filter((c) => c.id !== cardId))
        setCardLabels((prev) => prev.filter((cl) => cl.card_id !== cardId))
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

    const updateCardDueDate = (cardId: string, dueDate: string | null) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, due_date: dueDate } : c))
        supabase.from('cards').update({ due_date: dueDate }).eq('id', cardId)
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

    const moveColumn = (columnId: string, position: string) => {
        setColumns((prev) =>
            prev.map((c) => c.id === columnId ? { ...c, position } : c)
                .sort((a, b) => a.position < b.position ? -1 : 1)
        )
        supabase.from('columns').update({ position }).eq('id', columnId)
            .then(({ error }) => { if (error) console.error(error) })
    }

    const createLabel = (title: string, color: string) => {
        const lastPosition = labels[labels.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        setLabels((prev) => [...prev, { id, board_id: boardId, title, color, position }])
        supabase.from('labels').insert({ id, board_id: boardId, title, color, position })
            .then(({ error }) => { if (error) console.error(error) })
        return id
    }


    const toggleCardLabel = (cardId: string, labelId: string) => {
        const exists = cardLabels.some((cl) => cl.card_id === cardId && cl.label_id === labelId)
        if (exists) {
            setCardLabels((prev) => prev.filter((cl) => !(cl.card_id === cardId && cl.label_id === labelId)))
            supabase.from('card_labels').delete().eq('card_id', cardId).eq('label_id', labelId)
                .then(({ error }) => { if (error) console.error(error) })
        } else {
            setCardLabels((prev) => [...prev, { card_id: cardId, label_id: labelId }])
            supabase.from('card_labels').insert({ card_id: cardId, label_id: labelId })
                .then(({ error }) => { if (error) console.error(error) })
        }
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

    const selectedCardLabelIds = selectedCard
        ? new Set(cardLabels.filter((cl) => cl.card_id === selectedCard.id).map((cl) => cl.label_id))
        : new Set<string>()

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
                    labelsForCard={labelsForCard}
                    onAddColumn={addColumn}
                    onAddCard={addCard}
                    onArchiveColumn={archiveColumn}
                    onUpdateColumnTitle={updateColumnTitle}
                    onQuickEdit={(cardId, rect) => setQuickEditState({ cardId, rect })}
                    onMoveCard={moveCard}
                    onMoveCardLocally={moveCardLocally}
                    onMoveColumn={moveColumn}
                    onCardClick={setSelectedCardId}
                />
            </div>
            {quickEditState && (() => {
                const qCard = cards.find((c) => c.id === quickEditState.cardId)
                if (!qCard) return null
                const qLabelIds = new Set(cardLabels.filter((cl) => cl.card_id === qCard.id).map((cl) => cl.label_id))
                return (
                    <QuickEditPopup
                        card={qCard}
                        rect={quickEditState.rect}
                        columns={columns}
                        labels={labels}
                        cardLabelIds={qLabelIds}
                        onUpdateTitle={(title) => updateCardTitle(qCard.id, title)}
                        onMoveToColumn={(columnId) => moveCardToColumn(qCard.id, columnId)}
                        onToggleLabel={(labelId) => toggleCardLabel(qCard.id, labelId)}
                        onCreateLabel={createLabel}
                        onArchive={() => { archiveCard(qCard.id); setQuickEditState(null) }}
                        onOpenDetail={() => { setQuickEditState(null); setSelectedCardId(qCard.id) }}
                        onClose={() => setQuickEditState(null)}
                    />
                )
            })()}
            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    columns={columns}
                    labels={labels}
                    cardLabelIds={selectedCardLabelIds}
                    onUpdateTitle={(title) => updateCardTitle(selectedCard.id, title)}
                    onUpdateDescription={(desc) => updateCardDescription(selectedCard.id, desc)}
                    onUpdateDueDate={(date) => updateCardDueDate(selectedCard.id, date)}
                    onMoveToColumn={(columnId) => moveCardToColumn(selectedCard.id, columnId)}
                    onToggleLabel={(labelId) => toggleCardLabel(selectedCard.id, labelId)}
                    onCreateLabel={createLabel}
                    onArchive={() => archiveCard(selectedCard.id)}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </div>
    )
}

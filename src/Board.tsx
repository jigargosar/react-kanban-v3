import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { generateKeyBetween } from 'fractional-indexing'
import { useState } from 'react'
import { supabase } from './supabase'
import { KanbanColumn } from './Column'
import { KanbanCard } from './Card'
import type { Column, Card } from './types'

type BoardProps = {
    columns: Column[]
    cards: Card[]
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>
    setCards: React.Dispatch<React.SetStateAction<Card[]>>
}

export function Board({ columns, cards, setColumns, setCards }: BoardProps) {
    const [activeCard, setActiveCard] = useState<Card | null>(null)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    const cardsForColumn = (columnId: string) =>
        cards
            .filter((c) => c.column_id === columnId)
            .sort((a, b) => a.position < b.position ? -1 : 1)

    const addColumn = () => {
        const lastPosition = columns[columns.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        const title = `Column ${columns.length + 1}`

        setColumns((prev) => [...prev, { id, title, position, archived: false }])
        supabase.from('columns').insert({ id, title, position }).then(({ error }) => { if (error) console.error(error) })
    }

    const addCard = (columnId: string) => {
        const columnCards = cardsForColumn(columnId)
        const lastPosition = columnCards[columnCards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        const title = `Card ${cards.length + 1}`

        setCards((prev) => [...prev, { id, column_id: columnId, title, description: '', position, archived: false }])
        supabase.from('cards').insert({ id, column_id: columnId, title, position }).then(({ error }) => { if (error) console.error(error) })
    }

    const archiveCard = (cardId: string) => {
        setCards((prev) => prev.filter((c) => c.id !== cardId))
        supabase.from('cards').update({ archived: true }).eq('id', cardId).then(({ error }) => { if (error) console.error(error) })
    }

    const archiveColumn = (columnId: string) => {
        setColumns((prev) => prev.filter((c) => c.id !== columnId))
        setCards((prev) => prev.filter((c) => c.column_id !== columnId))
        supabase.from('columns').update({ archived: true }).eq('id', columnId).then(({ error }) => { if (error) console.error(error) })
    }

    const updateCardTitle = (cardId: string, title: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, title } : c))
        supabase.from('cards').update({ title }).eq('id', cardId).then(({ error }) => { if (error) console.error(error) })
    }

    const updateColumnTitle = (columnId: string, title: string) => {
        setColumns((prev) => prev.map((c) => c.id === columnId ? { ...c, title } : c))
        supabase.from('columns').update({ title }).eq('id', columnId).then(({ error }) => { if (error) console.error(error) })
    }

    const handleDragStart = (event: DragStartEvent) => {
        const card = cards.find((c) => c.id === event.active.id)
        if (card) setActiveCard(card)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeCardId = active.id as string
        const card = cards.find((c) => c.id === activeCardId)
        if (!card) return

        const overCard = cards.find((c) => c.id === over.id)
        const overColumn = columns.find((c) => c.id === over.id)

        const targetColumnId = overCard ? overCard.column_id : overColumn?.id
        if (!targetColumnId || targetColumnId === card.column_id) return

        setCards((prev) =>
            prev.map((c) => c.id === activeCardId ? { ...c, column_id: targetColumnId } : c)
        )
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveCard(null)
        const { active, over } = event
        if (!over) return

        const activeCardId = active.id as string
        const card = cards.find((c) => c.id === activeCardId)
        if (!card) return

        const overCard = cards.find((c) => c.id === over.id)
        const targetColumnId = overCard ? overCard.column_id : (columns.find((c) => c.id === over.id)?.id ?? card.column_id)

        const columnCards = cards
            .filter((c) => c.column_id === targetColumnId && c.id !== activeCardId)
            .sort((a, b) => a.position < b.position ? -1 : 1)

        let newPosition: string
        if (overCard) {
            const overIndex = columnCards.findIndex((c) => c.id === overCard.id)
            const before = columnCards[overIndex - 1]?.position ?? null
            const after = columnCards[overIndex]?.position ?? null
            newPosition = generateKeyBetween(before, after)
        } else {
            const lastPosition = columnCards[columnCards.length - 1]?.position ?? null
            newPosition = generateKeyBetween(lastPosition, null)
        }

        setCards((prev) =>
            prev.map((c) => c.id === activeCardId ? { ...c, column_id: targetColumnId, position: newPosition } : c)
                .sort((a, b) => a.position < b.position ? -1 : 1)
        )

        supabase.from('cards').update({ column_id: targetColumnId, position: newPosition }).eq('id', activeCardId).then(({ error }) => { if (error) console.error(error) })
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 items-start h-full overflow-x-auto hide-scrollbar">
                <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            cards={cardsForColumn(column.id)}
                            onAddCard={() => addCard(column.id)}
                            onArchiveCard={archiveCard}
                            onArchiveColumn={() => archiveColumn(column.id)}
                            onUpdateCardTitle={updateCardTitle}
                            onUpdateColumnTitle={(title) => updateColumnTitle(column.id, title)}
                        />
                    ))}
                </SortableContext>
                <button
                    onClick={addColumn}
                    className="shrink-0 w-72 rounded-xl border border-dashed border-white/[0.06] p-4 text-sm text-white/20 hover:border-white/[0.12] hover:text-white/40 hover:bg-white/[0.02] transition-all cursor-pointer"
                >
                    + Add Column
                </button>
            </div>
            <DragOverlay>
                {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    )
}

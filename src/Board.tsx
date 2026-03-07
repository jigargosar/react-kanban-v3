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
import { KanbanColumn } from './Column'
import { KanbanCard } from './Card'
import type { Column, Card } from './types'

type BoardProps = {
    columns: Column[]
    cards: Card[]
    cardsForColumn: (columnId: string) => Card[]
    onAddColumn: () => void
    onAddCard: (columnId: string, title: string) => void
    onArchiveCard: (cardId: string) => void
    onArchiveColumn: (columnId: string) => void
    onUpdateCardTitle: (cardId: string, title: string) => void
    onUpdateColumnTitle: (columnId: string, title: string) => void
    onMoveCard: (cardId: string, columnId: string, position: string) => void
    onMoveCardLocally: (cardId: string, columnId: string) => void
    onCardClick: (cardId: string) => void
}

export function Board({
    columns,
    cards,
    cardsForColumn,
    onAddColumn,
    onAddCard,
    onArchiveCard,
    onArchiveColumn,
    onUpdateCardTitle,
    onUpdateColumnTitle,
    onMoveCard,
    onMoveCardLocally,
    onCardClick,
}: BoardProps) {
    const [activeCard, setActiveCard] = useState<Card | null>(null)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

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

        onMoveCardLocally(activeCardId, targetColumnId)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveCard(null)
        const { active, over } = event
        if (!over) return

        const activeCardId = active.id as string
        const card = cards.find((c) => c.id === activeCardId)
        if (!card) return

        const overCard = cards.find((c) => c.id === over.id)
        const targetColumnId = overCard
            ? overCard.column_id
            : (columns.find((c) => c.id === over.id)?.id ?? card.column_id)

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

        onMoveCard(activeCardId, targetColumnId, newPosition)
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
                            onAddCard={(title) => onAddCard(column.id, title)}
                            onArchiveCard={onArchiveCard}
                            onArchiveColumn={() => onArchiveColumn(column.id)}
                            onUpdateCardTitle={onUpdateCardTitle}
                            onUpdateColumnTitle={(title) => onUpdateColumnTitle(column.id, title)}
                            onCardClick={onCardClick}
                        />
                    ))}
                </SortableContext>
                <button
                    onClick={onAddColumn}
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

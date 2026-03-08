import {
    DndContext,
    DragOverlay,
    closestCenter,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type CollisionDetection,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { generateKeyBetween } from 'fractional-indexing'
import { useState } from 'react'
import { KanbanColumn } from './Column'
import { KanbanCard } from './Card'
import type { Column, Card, Label } from './types'

type BoardProps = {
    columns: Column[]
    cards: Card[]
    cardsForColumn: (columnId: string) => Card[]
    labelsForCard: (cardId: string) => Label[]
    onAddColumn: () => void
    onAddCard: (columnId: string, title: string) => void
    onArchiveColumn: (columnId: string) => void
    onUpdateColumnTitle: (columnId: string, title: string) => void
    onQuickEdit: (cardId: string, rect: DOMRect) => void
    onMoveCard: (cardId: string, columnId: string, position: string) => void
    onMoveCardLocally: (cardId: string, columnId: string) => void
    onMoveColumn: (columnId: string, position: string) => void
    onMoveColumnLocally: (activeId: string, overId: string) => void
    onCardClick: (cardId: string) => void
}

export function Board({
    columns,
    cards,
    cardsForColumn,
    labelsForCard,
    onAddColumn,
    onAddCard,
    onArchiveColumn,
    onUpdateColumnTitle,
    onQuickEdit,
    onMoveCard,
    onMoveCardLocally,
    onMoveColumn,
    onMoveColumnLocally,
    onCardClick,
}: BoardProps) {
    const [activeCard, setActiveCard] = useState<Card | null>(null)
    const [activeColumn, setActiveColumn] = useState<Column | null>(null)
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    const columnIds = new Set(columns.map((c) => c.id))
    const collisionDetection: CollisionDetection = (args) => {
        if (activeColumn) {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter(
                    (container) => columnIds.has(container.id as string)
                ),
            })
        }
        return closestCorners(args)
    }

    const handleDragStart = (event: DragStartEvent) => {
        const activeId = event.active.id as string
        const card = cards.find((c) => c.id === activeId)
        if (card) { setActiveCard(card); return }
        const column = columns.find((c) => c.id === activeId)
        if (column) setActiveColumn(column)
    }

    const handleDragOver = (event: DragOverEvent) => {
        if (activeColumn) {
            const overId = event.over?.id as string | undefined
            if (overId && overId !== activeColumn.id && columnIds.has(overId)) {
                onMoveColumnLocally(activeColumn.id, overId)
            }
            return
        }

        const { active, over } = event
        if (!over) return

        const activeCardId = active.id as string
        const card = cards.find((c) => c.id === activeCardId)
        if (!card) return

        const overCard = cards.find((c) => c.id === over.id)
        const overCol = columns.find((c) => c.id === over.id)

        const targetColumnId = overCard ? overCard.column_id : overCol?.id
        if (!targetColumnId || targetColumnId === card.column_id) return

        onMoveCardLocally(activeCardId, targetColumnId)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const wasCard = activeCard !== null
        const wasColumn = activeColumn !== null
        setActiveCard(null)
        setActiveColumn(null)

        const { active, over } = event
        if (!over) return

        if (wasCard) {
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
        } else if (wasColumn) {
            const activeColumnId = active.id as string
            const overColumnId = over.id as string
            if (activeColumnId === overColumnId) return

            const overIndex = columns.findIndex((c) => c.id === overColumnId)
            const before = columns[overIndex - 1]?.position ?? null
            const after = columns[overIndex]?.position ?? null
            const newPosition = generateKeyBetween(before, after)
            onMoveColumn(activeColumnId, newPosition)
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
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
                            labelsForCard={labelsForCard}
                            onAddCard={(title) => onAddCard(column.id, title)}
                            onArchiveColumn={() => onArchiveColumn(column.id)}
                            onUpdateColumnTitle={(title) => onUpdateColumnTitle(column.id, title)}
                            onQuickEdit={onQuickEdit}
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
                {activeCard ? (
                    <KanbanCard card={activeCard} labels={labelsForCard(activeCard.id)} isOverlay />
                ) : null}
                {activeColumn ? (() => {
                    const columnCards = cardsForColumn(activeColumn.id)
                    return (
                        <div className="w-72 rounded-xl bg-white/[0.035] border border-accent/30 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rotate-1 opacity-40 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2.5">
                                <h2 className="text-[13px] font-medium text-white/50 truncate">
                                    {activeColumn.title}
                                </h2>
                                <span className="text-[10px] font-medium text-white/25 bg-white/[0.06] rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">
                                    {columnCards.length}
                                </span>
                            </div>
                            <div className="px-2 pb-1 space-y-1.5 overflow-hidden">
                                {columnCards.map((card) => (
                                    <KanbanCard key={card.id} card={card} labels={labelsForCard(card.id)} />
                                ))}
                            </div>
                            <div className="px-3 py-2.5 text-[13px] text-white/15">
                                + Add Card
                            </div>
                        </div>
                    )
                })() : null}
            </DragOverlay>
        </DndContext>
    )
}

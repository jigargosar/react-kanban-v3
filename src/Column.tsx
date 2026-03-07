import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { SortableCard } from './Card'
import type { Card, Column } from './types'

type KanbanColumnProps = {
    column: Column
    cards: Card[]
    onAddCard: () => void
    onArchiveCard: (cardId: string) => void
    onArchiveColumn: () => void
    onUpdateCardTitle: (cardId: string, title: string) => void
    onUpdateColumnTitle: (title: string) => void
}

export function KanbanColumn({
    column,
    cards,
    onAddCard,
    onArchiveCard,
    onArchiveColumn,
    onUpdateCardTitle,
    onUpdateColumnTitle,
}: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({ id: column.id })
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(column.title)

    const commitTitle = () => {
        setEditing(false)
        const trimmed = title.trim()
        if (trimmed && trimmed !== column.title) {
            onUpdateColumnTitle(trimmed)
        } else {
            setTitle(column.title)
        }
    }

    return (
        <div
            ref={setNodeRef}
            className="shrink-0 w-72 rounded-xl bg-gray-900 flex flex-col max-h-[calc(100vh-8rem)]"
        >
            <div className="flex items-center justify-between p-3">
                {editing ? (
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={commitTitle}
                        onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
                        className="flex-1 bg-transparent text-white font-semibold text-sm outline-none border-b border-blue-500"
                        autoFocus
                    />
                ) : (
                    <h2
                        className="font-semibold text-sm text-gray-300 cursor-pointer"
                        onDoubleClick={() => setEditing(true)}
                    >
                        {column.title}
                        <span className="ml-2 text-gray-600">{cards.length}</span>
                    </h2>
                )}
                <button
                    onClick={onArchiveColumn}
                    className="text-gray-600 hover:text-red-400 text-xs px-1 cursor-pointer"
                    title="Archive column"
                >
                    &times;
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-1 space-y-2">
                <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            onArchive={() => onArchiveCard(card.id)}
                            onUpdateTitle={(t) => onUpdateCardTitle(card.id, t)}
                        />
                    ))}
                </SortableContext>
            </div>
            <button
                onClick={onAddCard}
                className="p-3 text-sm text-gray-500 hover:text-white hover:bg-gray-800 rounded-b-xl transition-colors cursor-pointer"
            >
                + Add Card
            </button>
        </div>
    )
}

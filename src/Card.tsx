import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { Card } from './types'

type KanbanCardProps = {
    card: Card
    isOverlay?: boolean
    onArchive?: () => void
    onUpdateTitle?: (title: string) => void
}

export function KanbanCard({ card, isOverlay, onArchive, onUpdateTitle }: KanbanCardProps) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(card.title)

    const commitTitle = () => {
        setEditing(false)
        const trimmed = title.trim()
        if (trimmed && trimmed !== card.title && onUpdateTitle) {
            onUpdateTitle(trimmed)
        } else {
            setTitle(card.title)
        }
    }

    return (
        <div
            className={`rounded-lg bg-gray-800 p-3 text-sm text-white shadow-sm group ${
                isOverlay ? 'rotate-3 shadow-lg opacity-90' : ''
            }`}
        >
            {editing ? (
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
                    className="w-full bg-transparent outline-none border-b border-blue-500"
                    autoFocus
                />
            ) : (
                <div className="flex items-start justify-between">
                    <span
                        className="flex-1 cursor-pointer"
                        onDoubleClick={() => setEditing(true)}
                    >
                        {card.title}
                    </span>
                    {onArchive && (
                        <button
                            onClick={onArchive}
                            className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-2 cursor-pointer"
                            title="Archive"
                        >
                            &times;
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

type SortableCardProps = {
    card: Card
    onArchive: () => void
    onUpdateTitle: (title: string) => void
}

export function SortableCard({ card, onArchive, onUpdateTitle }: SortableCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanCard card={card} onArchive={onArchive} onUpdateTitle={onUpdateTitle} />
        </div>
    )
}

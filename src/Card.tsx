import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { Card, Label } from './types'
import { labelDotClass } from './types'

type KanbanCardProps = {
    card: Card
    labels?: Label[]
    isOverlay?: boolean
    onArchive?: () => void
    onUpdateTitle?: (title: string) => void
    onClick?: () => void
}

function formatDueDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const month = date.toLocaleString('en', { month: 'short' })
    const day = date.getDate()
    if (date.getFullYear() !== now.getFullYear()) {
        return `${month} ${day}, ${date.getFullYear()}`
    }
    return `${month} ${day}`
}

function isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date()
}

export function KanbanCard({ card, labels = [], isOverlay, onArchive, onUpdateTitle, onClick }: KanbanCardProps) {
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

    const handleCardClick = () => {
        if (!editing && onClick) onClick()
    }

    const startEditing = (e: React.MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
    }

    return (
        <div
            onClick={handleCardClick}
            className={`rounded-lg bg-surface-raised border text-[13px] text-white/80 group transition-all cursor-pointer ${
                isOverlay
                    ? 'rotate-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border-accent/30 scale-105'
                    : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.06]'
            }`}
        >
            {editing ? (
                <div className="p-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={commitTitle}
                        onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
                        className="w-full bg-transparent outline-none border-b border-accent/40 text-white pb-0.5"
                        autoFocus
                    />
                </div>
            ) : (
                <div className="p-2.5">
                    {labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                            {labels.map((label) => (
                                <span
                                    key={label.id}
                                    className={`h-1.5 w-6 rounded-full ${labelDotClass(label.color)}`}
                                />
                            ))}
                        </div>
                    )}
                    <div className="flex items-start justify-between">
                        <span className="flex-1 leading-relaxed">{card.title}</span>
                        <div className="flex items-center gap-0.5 shrink-0 ml-2 mt-0.5">
                            <button
                                onClick={startEditing}
                                className="text-white/0 group-hover:text-white/20 hover:!text-accent transition-all cursor-pointer p-0.5 rounded"
                                title="Quick edit"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            {onArchive && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onArchive() }}
                                    className="text-white/0 group-hover:text-white/20 hover:!text-red-400 transition-all cursor-pointer p-0.5 rounded"
                                    title="Archive"
                                >
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    {card.due_date && (
                        <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isOverdue(card.due_date) ? 'text-red-400' : 'text-white/25'}`}>
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDueDate(card.due_date)}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

type SortableCardProps = {
    card: Card
    labels: Label[]
    onArchive: () => void
    onUpdateTitle: (title: string) => void
    onClick: () => void
}

export function SortableCard({ card, labels, onArchive, onUpdateTitle, onClick }: SortableCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanCard card={card} labels={labels} onArchive={onArchive} onUpdateTitle={onUpdateTitle} onClick={onClick} />
        </div>
    )
}

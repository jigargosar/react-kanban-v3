import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card, Label } from './types'
import { labelDotClass } from './types'

type KanbanCardProps = {
    card: Card
    labels?: Label[]
    isOverlay?: boolean
    onQuickEdit?: (rect: DOMRect) => void
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

export function KanbanCard({ card, labels = [], isOverlay, onQuickEdit, onClick }: KanbanCardProps) {
    const handleQuickEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!onQuickEdit) return
        const cardEl = (e.currentTarget as HTMLElement).closest('[data-card-id]') as HTMLElement | null
        if (cardEl) onQuickEdit(cardEl.getBoundingClientRect())
    }

    return (
        <div
            data-card-id={card.id}
            onClick={onClick}
            className={`relative rounded-lg bg-surface-raised border text-[13px] text-white/80 group/card transition-all cursor-pointer ${
                isOverlay
                    ? 'rotate-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border-accent/30 scale-105'
                    : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.06]'
            }`}
        >
            {onQuickEdit && (
                <button
                    onClick={handleQuickEdit}
                    className="absolute top-1 right-1 z-10 p-1 rounded bg-surface/90 border border-white/[0.06] opacity-0 group-hover/card:opacity-100 hover:!bg-accent/20 hover:!border-accent/30 text-white/40 hover:!text-accent transition-all cursor-pointer"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
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
                <span className="leading-relaxed">{card.title}</span>
                {card.due_date && (
                    <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isOverdue(card.due_date) ? 'text-red-400' : 'text-white/25'}`}>
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDueDate(card.due_date)}
                    </div>
                )}
            </div>
        </div>
    )
}

type SortableCardProps = {
    card: Card
    labels: Label[]
    onQuickEdit: (rect: DOMRect) => void
    onClick: () => void
}

export function SortableCard({ card, labels, onQuickEdit, onClick }: SortableCardProps) {
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
            <KanbanCard card={card} labels={labels} onQuickEdit={onQuickEdit} onClick={onClick} />
        </div>
    )
}

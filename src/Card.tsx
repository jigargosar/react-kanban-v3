import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card, ChecklistItem, Label } from './types'
import { LABEL_COLORS, labelDotClass } from './types'

const COVER_COLORS: Record<string, string> = Object.fromEntries(
    LABEL_COLORS.map((c) => [c.key, c.dot])
)

type KanbanCardProps = {
    card: Card
    labels?: Label[]
    checklistItems?: ChecklistItem[]
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

export function KanbanCard({ card, labels = [], checklistItems = [], isOverlay, onQuickEdit, onClick }: KanbanCardProps) {
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
            className={`relative rounded-lg bg-surface-raised text-[13px] text-white/85 group/card transition-all cursor-pointer ${
                isOverlay
                    ? 'rotate-2 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-accent/30 scale-105'
                    : 'border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
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
            {card.cover_color && (
                <div className={`h-8 rounded-t-lg ${COVER_COLORS[card.cover_color] ?? 'bg-gray-400'}`} />
            )}
            <div className="p-3">
                {labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {labels.map((label) => (
                            <span
                                key={label.id}
                                title={label.title || label.color}
                                className={`h-2 w-8 rounded-sm ${labelDotClass(label.color)}`}
                            />
                        ))}
                    </div>
                )}
                <span className="leading-relaxed">{card.title}</span>
                {(card.due_date || checklistItems.length > 0) && (
                    <div className="flex items-center gap-3 mt-2">
                        {card.due_date && (
                            <div className={`flex items-center gap-1 text-[10px] ${isOverdue(card.due_date) ? 'text-red-400' : 'text-white/35'}`}>
                                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDueDate(card.due_date)}
                            </div>
                        )}
                        {checklistItems.length > 0 && (() => {
                            const checked = checklistItems.filter((ci) => ci.checked).length
                            const total = checklistItems.length
                            const allDone = checked === total
                            return (
                                <div className={`flex items-center gap-1 text-[10px] ${allDone ? 'text-emerald-400' : 'text-white/35'}`}>
                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    {checked}/{total}
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>
        </div>
    )
}

type SortableCardProps = {
    card: Card
    labels: Label[]
    checklistItems: ChecklistItem[]
    onQuickEdit: (rect: DOMRect) => void
    onClick: () => void
}

export function SortableCard({ card, labels, checklistItems, onQuickEdit, onClick }: SortableCardProps) {
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
            <KanbanCard card={card} labels={labels} checklistItems={checklistItems} onQuickEdit={onQuickEdit} onClick={onClick} />
        </div>
    )
}

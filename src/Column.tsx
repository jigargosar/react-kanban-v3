import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useRef, useState } from 'react'
import { SortableCard } from './Card'
import type { Card, Column } from './types'

type KanbanColumnProps = {
    column: Column
    cards: Card[]
    onAddCard: (title: string) => void
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
    const [adding, setAdding] = useState(false)
    const [newCardTitle, setNewCardTitle] = useState('')
    const addInputRef = useRef<HTMLInputElement>(null)

    const commitTitle = () => {
        setEditing(false)
        const trimmed = title.trim()
        if (trimmed && trimmed !== column.title) {
            onUpdateColumnTitle(trimmed)
        } else {
            setTitle(column.title)
        }
    }

    const submitCard = () => {
        const trimmed = newCardTitle.trim()
        if (trimmed) {
            onAddCard(trimmed)
            setNewCardTitle('')
        } else {
            setAdding(false)
            setNewCardTitle('')
        }
    }

    const startAdding = () => {
        setAdding(true)
        setNewCardTitle('')
    }

    return (
        <div
            ref={setNodeRef}
            className="shrink-0 w-72 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col max-h-[calc(100vh-8rem)] animate-fade-in-up"
        >
            <div className="flex items-center justify-between px-3 py-2.5">
                {editing ? (
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={commitTitle}
                        onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
                        className="flex-1 bg-transparent text-white text-sm font-semibold outline-none border-b border-accent/50"
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-2" onDoubleClick={() => setEditing(true)}>
                        <h2 className="text-[13px] font-semibold text-white/70 cursor-pointer uppercase tracking-wider">
                            {column.title}
                        </h2>
                        <span className="text-[11px] font-medium text-white/20 bg-white/[0.05] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                            {cards.length}
                        </span>
                    </div>
                )}
                <button
                    onClick={onArchiveColumn}
                    className="text-white/10 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/[0.05]"
                    title="Archive column"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto thin-scrollbar px-2 pb-1 space-y-1.5">
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
                {adding && (
                    <div className="rounded-lg bg-surface-raised border border-accent/20 p-2.5 animate-fade-in-up">
                        <input
                            ref={addInputRef}
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onBlur={submitCard}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    submitCard()
                                    setTimeout(() => addInputRef.current?.focus(), 0)
                                }
                                if (e.key === 'Escape') {
                                    setAdding(false)
                                    setNewCardTitle('')
                                }
                            }}
                            placeholder="Card title..."
                            className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/20"
                            autoFocus
                        />
                    </div>
                )}
            </div>
            {!adding ? (
                <button
                    onClick={startAdding}
                    className="px-3 py-2.5 text-[13px] text-white/15 hover:text-white/40 hover:bg-white/[0.03] rounded-b-xl transition-all cursor-pointer"
                >
                    + Add Card
                </button>
            ) : (
                <div className="px-3 py-2 text-[11px] text-white/20 rounded-b-xl">
                    Enter to add, empty to stop
                </div>
            )}
        </div>
    )
}

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import { SortableCard } from './Card'
import type { Card, Column, Label } from './types'

type KanbanColumnProps = {
    column: Column
    cards: Card[]
    labelsForCard: (cardId: string) => Label[]
    onAddCard: (title: string) => void
    onArchiveColumn: () => void
    onUpdateColumnTitle: (title: string) => void
    onQuickEdit: (cardId: string, rect: DOMRect) => void
    onCardClick: (cardId: string) => void
}

export function KanbanColumn({
    column,
    cards,
    labelsForCard,
    onAddCard,
    onArchiveColumn,
    onUpdateColumnTitle,
    onQuickEdit,
    onCardClick,
}: KanbanColumnProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(column.title)
    const [adding, setAdding] = useState(false)
    const [newCardTitle, setNewCardTitle] = useState('')
    const [showMenu, setShowMenu] = useState(false)
    const addInputRef = useRef<HTMLInputElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!showMenu) return
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showMenu])

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
            style={style}
            className={`shrink-0 w-72 rounded-xl flex flex-col max-h-[calc(100vh-8rem)] animate-fade-in-up ${
                isDragging
                    ? 'bg-white/[0.02] border-2 border-dashed border-accent/30'
                    : 'bg-white/[0.035] border border-white/[0.07]'
            }`}
        >
            <div className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing group/header" {...attributes} {...listeners}>
                <svg className="h-3 w-3 text-white/0 group-hover/header:text-white/15 shrink-0 mr-1 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                </svg>
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
                    <div className="flex items-center gap-2 flex-1 min-w-0" onDoubleClick={() => setEditing(true)}>
                        <h2 className="text-[13px] font-medium text-white/50 cursor-pointer truncate">
                            {column.title}
                        </h2>
                        <span className="text-[10px] font-medium text-white/25 bg-white/[0.06] rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">
                            {cards.length}
                        </span>
                    </div>
                )}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="text-white/0 group-hover/header:text-white/20 hover:!text-white/50 transition-colors cursor-pointer p-1 rounded hover:bg-white/[0.05]"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01" />
                        </svg>
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-white/[0.08] rounded-lg shadow-xl z-20 py-1 animate-fade-in-up">
                            <button
                                onClick={() => { setShowMenu(false); startAdding() }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors cursor-pointer"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Card
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); setEditing(true) }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors cursor-pointer"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Rename
                            </button>
                            <div className="my-1 border-t border-white/[0.06]" />
                            <button
                                onClick={() => { setShowMenu(false); onArchiveColumn() }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Archive List
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto thin-scrollbar px-2 pb-1 space-y-1.5">
                <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            labels={labelsForCard(card.id)}
                            onQuickEdit={(rect) => onQuickEdit(card.id, rect)}
                            onClick={() => onCardClick(card.id)}
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

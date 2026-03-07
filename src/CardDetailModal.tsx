import { useEffect, useRef, useState } from 'react'
import type { Card, Column } from './types'

type CardDetailModalProps = {
    card: Card
    columns: Column[]
    onUpdateTitle: (title: string) => void
    onUpdateDescription: (description: string) => void
    onMoveToColumn: (columnId: string) => void
    onArchive: () => void
    onClose: () => void
}

export function CardDetailModal({
    card,
    columns,
    onUpdateTitle,
    onUpdateDescription,
    onMoveToColumn,
    onArchive,
    onClose,
}: CardDetailModalProps) {
    const [editingTitle, setEditingTitle] = useState(false)
    const [title, setTitle] = useState(card.title)
    const [editingDesc, setEditingDesc] = useState(false)
    const [description, setDescription] = useState(card.description)
    const descRef = useRef<HTMLTextAreaElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setTitle(card.title)
        setDescription(card.description)
    }, [card.title, card.description])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [onClose])

    const commitTitle = () => {
        setEditingTitle(false)
        const trimmed = title.trim()
        if (trimmed && trimmed !== card.title) {
            onUpdateTitle(trimmed)
        } else {
            setTitle(card.title)
        }
    }

    const commitDescription = () => {
        setEditingDesc(false)
        if (description !== card.description) {
            onUpdateDescription(description)
        }
    }

    const currentColumn = columns.find((c) => c.id === card.column_id)

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[10vh] animate-fade-in-up"
        >
            <div className="w-full max-w-lg rounded-xl bg-surface border border-white/[0.08] shadow-2xl">
                <div className="flex items-start justify-between p-5 pb-0">
                    <div className="flex-1 min-w-0">
                        {editingTitle ? (
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={commitTitle}
                                onKeyDown={(e) => e.key === 'Enter' && commitTitle()}
                                className="w-full bg-transparent text-lg font-semibold text-white outline-none border-b border-accent/50 pb-1"
                                autoFocus
                            />
                        ) : (
                            <h2
                                onClick={() => setEditingTitle(true)}
                                className="text-lg font-semibold text-white cursor-pointer hover:text-accent transition-colors"
                            >
                                {card.title}
                            </h2>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-white/25">in</span>
                            <select
                                value={card.column_id}
                                onChange={(e) => onMoveToColumn(e.target.value)}
                                className="text-[12px] text-white/50 bg-white/[0.05] border border-white/[0.08] rounded px-2 py-0.5 outline-none hover:border-white/[0.15] transition-colors cursor-pointer"
                            >
                                {columns.map((col) => (
                                    <option key={col.id} value={col.id} className="bg-gray-900">
                                        {col.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/20 hover:text-white/60 transition-colors cursor-pointer p-1 rounded hover:bg-white/[0.05] ml-4"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-5">
                    <label className="text-[11px] font-medium text-white/25 uppercase tracking-wider">
                        Description
                    </label>
                    {editingDesc ? (
                        <textarea
                            ref={descRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={commitDescription}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') commitDescription()
                            }}
                            rows={4}
                            className="mt-2 w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-[13px] text-white/80 outline-none resize-none focus:border-accent/30 transition-colors placeholder:text-white/15"
                            placeholder="Add a description..."
                            autoFocus
                        />
                    ) : (
                        <div
                            onClick={() => setEditingDesc(true)}
                            className="mt-2 min-h-[80px] rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 text-[13px] text-white/50 cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                        >
                            {card.description || 'Add a description...'}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                    <span className="text-[11px] text-white/15">
                        {currentColumn?.title ?? 'Unknown column'}
                    </span>
                    <button
                        onClick={onArchive}
                        className="text-[12px] text-white/25 hover:text-red-400 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-400/10"
                    >
                        Archive card
                    </button>
                </div>
            </div>
        </div>
    )
}

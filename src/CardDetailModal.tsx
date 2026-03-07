import { useEffect, useRef, useState } from 'react'
import type { Card, Column, Comment, Label } from './types'
import { labelDotClass } from './types'

type CardDetailModalProps = {
    card: Card
    columns: Column[]
    labels: Label[]
    cardLabelIds: Set<string>
    comments: Comment[]
    onUpdateTitle: (title: string) => void
    onUpdateDescription: (description: string) => void
    onUpdateDueDate: (date: string | null) => void
    onUpdateCover: (color: string | null) => void
    onMoveToColumn: (columnId: string) => void
    onToggleLabel: (labelId: string) => void
    onAddComment: (content: string) => void
    onArchive: () => void
    onClose: () => void
}

export function CardDetailModal({
    card,
    columns,
    labels,
    cardLabelIds,
    comments,
    onUpdateTitle,
    onUpdateDescription,
    onUpdateDueDate,
    onUpdateCover,
    onMoveToColumn,
    onToggleLabel,
    onAddComment,
    onArchive,
    onClose,
}: CardDetailModalProps) {
    const [editingTitle, setEditingTitle] = useState(false)
    const [title, setTitle] = useState(card.title)
    const [editingDesc, setEditingDesc] = useState(false)
    const [description, setDescription] = useState(card.description)
    const [showLabelPicker, setShowLabelPicker] = useState(false)
    const [showCoverPicker, setShowCoverPicker] = useState(false)
    const [commentText, setCommentText] = useState('')
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

    const submitComment = () => {
        const trimmed = commentText.trim()
        if (!trimmed) return
        onAddComment(trimmed)
        setCommentText('')
    }

    const activeLabels = labels.filter((l) => cardLabelIds.has(l.id))

    const dueDate = card.due_date ? card.due_date.split('T')[0] : ''
    const isOverdue = card.due_date ? new Date(card.due_date) < new Date() : false

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[8vh] overflow-y-auto animate-fade-in-up"
        >
            <div className="w-full max-w-2xl rounded-xl bg-surface border border-white/[0.08] shadow-2xl mb-12">
                {/* Cover color band */}
                {card.cover_color && (
                    <div className={`h-10 rounded-t-xl ${labelDotClass(card.cover_color)}`} />
                )}

                {/* Header */}
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

                <div className="flex gap-6 p-5">
                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-5">
                        {/* Active labels */}
                        {activeLabels.length > 0 && (
                            <div>
                                <label className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Labels</label>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {activeLabels.map((label) => (
                                        <span
                                            key={label.id}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium ${labelDotClass(label.color)} text-white/90`}
                                        >
                                            {label.title || '\u00A0'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Description</label>
                            {editingDesc ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={commitDescription}
                                    onKeyDown={(e) => { if (e.key === 'Escape') commitDescription() }}
                                    rows={5}
                                    className="mt-2 w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-[13px] text-white/80 outline-none resize-none focus:border-accent/30 transition-colors placeholder:text-white/15"
                                    placeholder="Add a description..."
                                    autoFocus
                                />
                            ) : (
                                <div
                                    onClick={() => setEditingDesc(true)}
                                    className="mt-2 min-h-[80px] rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 text-[13px] cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.1] transition-all whitespace-pre-wrap"
                                >
                                    <span className={card.description ? 'text-white/60' : 'text-white/20'}>
                                        {card.description || 'Add a description...'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Activity</label>
                            <div className="mt-2 flex gap-2">
                                <div className="shrink-0 h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                    Y
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                                        placeholder="Write a comment..."
                                        rows={2}
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 text-[12px] text-white/70 outline-none resize-none focus:border-accent/30 transition-colors placeholder:text-white/15"
                                    />
                                    {commentText.trim() && (
                                        <button
                                            onClick={submitComment}
                                            className="mt-1.5 px-3 py-1 bg-accent text-surface text-[11px] font-semibold rounded-lg hover:brightness-110 transition-all cursor-pointer"
                                        >
                                            Save
                                        </button>
                                    )}
                                </div>
                            </div>
                            {comments.length > 0 && (
                                <div className="mt-3 space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-2">
                                            <div className="shrink-0 h-7 w-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/30">
                                                {comment.author_name[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-medium text-white/60">{comment.author_name}</span>
                                                    <span className="text-[10px] text-white/20">
                                                        {new Date(comment.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                                        {' '}
                                                        {new Date(comment.created_at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-white/50 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar actions */}
                    <div className="w-44 shrink-0 space-y-3">
                        <p className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Actions</p>

                        {/* Labels */}
                        <div>
                            <button
                                onClick={() => setShowLabelPicker(!showLabelPicker)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/40 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Labels
                            </button>
                            {showLabelPicker && (
                                <div className="mt-2 space-y-1">
                                    {labels.map((label) => (
                                        <button
                                            key={label.id}
                                            onClick={() => onToggleLabel(label.id)}
                                            className={`w-full flex items-center gap-2 h-8 px-2.5 rounded text-[11px] font-medium text-white/90 transition-all cursor-pointer hover:brightness-110 ${labelDotClass(label.color)} ${
                                                cardLabelIds.has(label.id) ? 'ring-2 ring-white/40' : 'opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            {cardLabelIds.has(label.id) && (
                                                <svg className="h-3 w-3 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            <span className="truncate">{label.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Due date */}
                        <div>
                            <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/40 bg-white/[0.03] rounded-lg">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => onUpdateDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                    className={`flex-1 bg-transparent outline-none cursor-pointer ${
                                        isOverdue ? 'text-red-400' : 'text-white/50'
                                    }`}
                                />
                            </div>
                            {card.due_date && (
                                <button
                                    onClick={() => onUpdateDueDate(null)}
                                    className="mt-1 text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer px-3"
                                >
                                    Remove date
                                </button>
                            )}
                        </div>

                        {/* Cover color */}
                        <div>
                            <button
                                onClick={() => setShowCoverPicker(!showCoverPicker)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/40 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Cover
                            </button>
                            {showCoverPicker && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {labels.map((label) => (
                                            <button
                                                key={label.id}
                                                onClick={() => onUpdateCover(label.color)}
                                                className={`h-6 w-10 rounded ${labelDotClass(label.color)} transition-all cursor-pointer ${
                                                    card.cover_color === label.color ? 'ring-2 ring-white/50 scale-105' : 'opacity-60 hover:opacity-90'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {card.cover_color && (
                                        <button
                                            onClick={() => onUpdateCover(null)}
                                            className="text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                                        >
                                            Remove cover
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Archive */}
                        <button
                            onClick={onArchive}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

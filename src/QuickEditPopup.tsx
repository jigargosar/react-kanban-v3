import { useEffect, useRef, useState } from 'react'
import type { Card, Column, Label } from './types'
import { LABEL_COLORS, labelDotClass, labelBgClass } from './types'

type QuickEditPopupProps = {
    card: Card
    rect: DOMRect
    columns: Column[]
    labels: Label[]
    cardLabelIds: Set<string>
    onUpdateTitle: (title: string) => void
    onMoveToColumn: (columnId: string) => void
    onToggleLabel: (labelId: string) => void
    onCreateLabel: (title: string, color: string) => void
    onArchive: () => void
    onOpenDetail: () => void
    onClose: () => void
}

export function QuickEditPopup({
    card,
    rect,
    columns,
    labels,
    cardLabelIds,
    onUpdateTitle,
    onMoveToColumn,
    onToggleLabel,
    onCreateLabel,
    onArchive,
    onOpenDetail,
    onClose,
}: QuickEditPopupProps) {
    const [title, setTitle] = useState(card.title)
    const [showLabels, setShowLabels] = useState(false)
    const [newLabelTitle, setNewLabelTitle] = useState('')
    const [newLabelColor, setNewLabelColor] = useState('green')
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [onClose])

    const commitTitle = () => {
        const trimmed = title.trim()
        if (trimmed && trimmed !== card.title) {
            onUpdateTitle(trimmed)
        } else {
            setTitle(card.title)
        }
    }

    const handleSave = () => {
        commitTitle()
        onClose()
    }

    const createLabel = () => {
        const trimmed = newLabelTitle.trim()
        if (!trimmed) return
        onCreateLabel(trimmed, newLabelColor)
        setNewLabelTitle('')
    }

    // Positioning logic
    const actionsWidth = 160
    const actionsGap = 6

    const rightEdge = rect.left + rect.width + actionsGap + actionsWidth
    const overflowRight = rightEdge > window.innerWidth - 12
    const actionsLeft = overflowRight
        ? rect.left - actionsWidth - actionsGap
        : rect.left + rect.width + actionsGap

    const clampedTop = Math.max(12, Math.min(rect.top, window.innerHeight - 320))

    const activeLabels = labels.filter((l) => cardLabelIds.has(l.id))

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) { commitTitle(); onClose() } }}
            className="fixed inset-0 z-50 bg-black/60"
        >
            {/* Lifted card editor */}
            <div
                style={{ top: clampedTop, left: rect.left, width: rect.width }}
                className="fixed animate-quick-edit-in"
            >
                <div className="rounded-xl bg-surface-raised border border-white/[0.1] shadow-[0_12px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
                    {activeLabels.length > 0 && (
                        <div className="flex flex-wrap gap-1 px-3 pt-2.5">
                            {activeLabels.map((label) => (
                                <span
                                    key={label.id}
                                    className={`h-1.5 w-6 rounded-full ${labelDotClass(label.color)}`}
                                />
                            ))}
                        </div>
                    )}
                    <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() } }}
                        rows={3}
                        className="w-full bg-transparent text-[13px] text-white/90 px-3 py-2 outline-none resize-none leading-relaxed"
                        autoFocus
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="mt-2 px-4 py-1.5 bg-accent text-surface text-[12px] font-semibold rounded-lg hover:brightness-110 transition-all cursor-pointer"
                >
                    Save
                </button>
            </div>

            {/* Action sidebar */}
            <div
                style={{ top: clampedTop, left: actionsLeft, width: actionsWidth }}
                className="fixed flex flex-col gap-1"
            >
                <button
                    onClick={onOpenDetail}
                    style={{ animationDelay: '0ms' }}
                    className="flex items-center gap-2.5 px-3 py-[7px] text-[12px] font-medium text-white/60 bg-white/[0.07] hover:bg-white/[0.12] rounded-lg transition-colors cursor-pointer animate-fade-in-up"
                >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Open Card
                </button>
                <button
                    onClick={() => setShowLabels(!showLabels)}
                    style={{ animationDelay: '30ms' }}
                    className="flex items-center gap-2.5 px-3 py-[7px] text-[12px] font-medium text-white/60 bg-white/[0.07] hover:bg-white/[0.12] rounded-lg transition-colors cursor-pointer animate-fade-in-up"
                >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Labels
                </button>
                <div
                    style={{ animationDelay: '60ms' }}
                    className="flex items-center gap-2.5 px-3 py-[7px] text-[12px] font-medium text-white/60 bg-white/[0.07] hover:bg-white/[0.12] rounded-lg transition-colors cursor-pointer animate-fade-in-up"
                >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <select
                        value={card.column_id}
                        onChange={(e) => { onMoveToColumn(e.target.value); onClose() }}
                        className="flex-1 bg-transparent outline-none cursor-pointer text-white/60 min-w-0"
                    >
                        {columns.map((col) => (
                            <option key={col.id} value={col.id} className="bg-gray-900">
                                {col.title}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={onArchive}
                    style={{ animationDelay: '90ms' }}
                    className="flex items-center gap-2.5 px-3 py-[7px] text-[12px] font-medium text-white/40 bg-white/[0.07] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer animate-fade-in-up"
                >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archive
                </button>

                {showLabels && (
                    <div className="mt-1 p-2.5 bg-surface border border-white/[0.08] rounded-xl shadow-lg space-y-1 animate-fade-in-up">
                        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider px-1 pb-1">Labels</p>
                        {labels.map((label) => (
                            <button
                                key={label.id}
                                onClick={() => onToggleLabel(label.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                    cardLabelIds.has(label.id)
                                        ? `${labelBgClass(label.color)} text-white/80`
                                        : 'text-white/40 hover:bg-white/[0.05]'
                                }`}
                            >
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${labelDotClass(label.color)}`} />
                                <span className="flex-1 text-left truncate">{label.title}</span>
                                {cardLabelIds.has(label.id) && (
                                    <svg className="h-3 w-3 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                        <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                            <div className="flex gap-1">
                                <input
                                    value={newLabelTitle}
                                    onChange={(e) => setNewLabelTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') createLabel() }}
                                    placeholder="New label..."
                                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-[10px] text-white outline-none placeholder:text-white/20 focus:border-accent/30 transition-colors"
                                />
                                <button
                                    onClick={createLabel}
                                    className="px-2 py-1 bg-accent/20 text-accent text-[10px] rounded-md hover:bg-accent/30 transition-colors cursor-pointer font-medium"
                                >
                                    +
                                </button>
                            </div>
                            <div className="flex gap-1 px-0.5">
                                {LABEL_COLORS.map((c) => (
                                    <button
                                        key={c.key}
                                        onClick={() => setNewLabelColor(c.key)}
                                        className={`h-4 w-4 rounded-full ${c.dot} transition-all cursor-pointer ${
                                            newLabelColor === c.key ? 'ring-2 ring-white/40 scale-110' : 'opacity-40 hover:opacity-80'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

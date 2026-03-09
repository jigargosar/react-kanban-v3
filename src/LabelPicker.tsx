import { useState } from 'react'
import type { Label } from './types'
import { labelDotClass } from './types'

type LabelPickerProps = {
    labels: Label[]
    cardLabelIds: Set<string>
    onToggleLabel: (labelId: string) => void
    onUpdateLabelTitle: (labelId: string, title: string) => void
    compact?: boolean
}

export function LabelPicker({ labels, cardLabelIds, onToggleLabel, onUpdateLabelTitle, compact = false }: LabelPickerProps) {
    const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
    const [editingLabelTitle, setEditingLabelTitle] = useState('')

    const itemHeight = compact ? 'h-7' : 'h-8'
    const itemPadding = compact ? 'px-2' : 'px-2.5'
    const editIconSize = compact ? 'h-2.5 w-2.5' : 'h-3 w-3'
    const editBtnPadding = compact ? 'p-0.5' : 'p-1'

    const commitLabelTitle = (labelId: string) => {
        onUpdateLabelTitle(labelId, editingLabelTitle)
        setEditingLabelId(null)
    }

    return (
        <div className="space-y-1">
            {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-1">
                    {editingLabelId === label.id ? (
                        <input
                            value={editingLabelTitle}
                            onChange={(e) => setEditingLabelTitle(e.target.value)}
                            onBlur={() => commitLabelTitle(label.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter') commitLabelTitle(label.id) }}
                            className={`flex-1 ${itemHeight} ${itemPadding} rounded text-[11px] font-medium text-white outline-none ${labelDotClass(label.color)}`}
                            autoFocus
                        />
                    ) : (
                        <button
                            onClick={() => onToggleLabel(label.id)}
                            className={`flex-1 flex items-center gap-2 ${itemHeight} ${itemPadding} rounded text-[11px] font-medium text-white/90 transition-all cursor-pointer hover:brightness-110 ${labelDotClass(label.color)} ${
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
                    )}
                    <button
                        onClick={() => { setEditingLabelId(label.id); setEditingLabelTitle(label.title) }}
                        className={`shrink-0 ${editBtnPadding} text-white/20 hover:text-white/60 transition-colors cursor-pointer`}
                    >
                        <svg className={editIconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    )
}

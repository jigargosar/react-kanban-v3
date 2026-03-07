import { useState } from 'react'
import type { Board } from './types'

type SidebarProps = {
    boards: Board[]
    selectedBoardId: string | null
    onSelectBoard: (boardId: string) => void
    onAddBoard: () => void
    onArchiveBoard: (boardId: string) => void
    onUpdateBoardTitle: (boardId: string, title: string) => void
}

export function Sidebar({
    boards,
    selectedBoardId,
    onSelectBoard,
    onAddBoard,
    onArchiveBoard,
    onUpdateBoardTitle,
}: SidebarProps) {
    return (
        <div className="w-56 shrink-0 border-r border-white/[0.04] flex flex-col h-full bg-white/[0.01]">
            <div className="px-4 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-accent/15 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <rect x="3" y="16" width="7" height="5" rx="1" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-white tracking-tight">Kanban</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto thin-scrollbar py-3 px-2">
                <p className="px-2 pb-2 text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                    Boards
                </p>
                <div className="space-y-0.5">
                    {boards.map((board) => (
                        <SidebarBoardItem
                            key={board.id}
                            board={board}
                            isSelected={board.id === selectedBoardId}
                            onSelect={() => onSelectBoard(board.id)}
                            onArchive={() => onArchiveBoard(board.id)}
                            onUpdateTitle={(title) => onUpdateBoardTitle(board.id, title)}
                        />
                    ))}
                </div>
            </div>
            <div className="px-2 py-3 border-t border-white/[0.04]">
                <button
                    onClick={onAddBoard}
                    className="w-full px-3 py-2 text-[13px] text-white/25 hover:text-white/50 hover:bg-white/[0.03] rounded-lg transition-all cursor-pointer text-left"
                >
                    + New Board
                </button>
            </div>
        </div>
    )
}

function SidebarBoardItem({ board, isSelected, onSelect, onArchive, onUpdateTitle }: {
    board: Board
    isSelected: boolean
    onSelect: () => void
    onArchive: () => void
    onUpdateTitle: (title: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(board.title)

    const commitTitle = () => {
        setEditing(false)
        const trimmed = title.trim()
        if (trimmed && trimmed !== board.title) {
            onUpdateTitle(trimmed)
        } else {
            setTitle(board.title)
        }
    }

    return (
        <div
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                    ? 'bg-accent/10 text-white/90'
                    : 'text-white/40 hover:text-white/65 hover:bg-white/[0.04]'
            }`}
            onClick={onSelect}
        >
            {editing ? (
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitTitle()
                        if (e.key === 'Escape') { setTitle(board.title); setEditing(false) }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-[13px] outline-none border-b border-accent/50 text-white min-w-0"
                    autoFocus
                />
            ) : (
                <>
                    <span
                        className="flex-1 text-[13px] truncate"
                        onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
                    >
                        {board.title}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onArchive() }}
                        className="shrink-0 text-white/0 group-hover:text-white/15 hover:!text-red-400 transition-all cursor-pointer p-0.5 rounded"
                        title="Archive board"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    )
}

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { generateKeyBetween } from 'fractional-indexing'
import { Sidebar } from './Sidebar'
import { BoardView } from './BoardView'
import type { Board } from './types'
import { LABEL_COLORS } from './types'

export function App() {
    const [boards, setBoards] = useState<Board[]>([])
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

    useEffect(() => {
        supabase.from('boards').select('*').eq('archived', false).order('position')
            .then(({ data, error }) => {
                if (error) { setStatus('error'); return }
                if (!data || data.length === 0) {
                    const id = crypto.randomUUID()
                    const position = generateKeyBetween(null, null)
                    setBoards([{ id, title: 'My Board', position, archived: false }])
                    setSelectedBoardId(id)
                    setStatus('connected')
                    supabase.from('boards').insert({ id, title: 'My Board', position })
                        .then(({ error }) => { if (error) console.error(error) })
                    supabase.from('columns').update({ board_id: id }).is('board_id', null)
                        .then(({ error }) => { if (error) console.error(error) })
                } else {
                    setBoards(data)
                    setSelectedBoardId(data[0].id)
                    setStatus('connected')
                }
            })

        const channel = supabase
            .channel('boards-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'boards' }, (payload) => {
                if (payload.eventType === 'DELETE') {
                    setBoards((prev) => prev.filter((b) => b.id !== payload.old.id))
                    return
                }
                const board = payload.new as Board
                setBoards((prev) => {
                    if (board.archived) return prev.filter((b) => b.id !== board.id)
                    const exists = prev.some((b) => b.id === board.id)
                    const next = exists
                        ? prev.map((b) => b.id === board.id ? board : b)
                        : [...prev, board]
                    return next.sort((a, b) => a.position < b.position ? -1 : 1)
                })
            })
            .subscribe()

        return () => { channel.unsubscribe() }
    }, [])

    const addBoard = () => {
        const lastPosition = boards[boards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        const title = `Board ${boards.length + 1}`
        setBoards((prev) => [...prev, { id, title, position, archived: false }])
        setSelectedBoardId(id)
        supabase.from('boards').insert({ id, title, position })
            .then(({ error }) => {
                if (error) { console.error(error); return }
                const defaultLabels = LABEL_COLORS.map((c, i) => ({
                    id: crypto.randomUUID(),
                    board_id: id,
                    title: '',
                    color: c.key,
                    position: `a${i}`,
                }))
                supabase.from('labels').insert(defaultLabels)
                    .then(({ error }) => { if (error) console.error(error) })
            })
    }

    const archiveBoard = (boardId: string) => {
        const remaining = boards.filter((b) => b.id !== boardId)
        setBoards(remaining)
        if (selectedBoardId === boardId) {
            setSelectedBoardId(remaining[0]?.id ?? null)
        }
        supabase.from('boards').update({ archived: true }).eq('id', boardId).then(({ error }) => { if (error) console.error(error) })
    }

    const updateBoardTitle = (boardId: string, title: string) => {
        setBoards((prev) => prev.map((b) => b.id === boardId ? { ...b, title } : b))
        supabase.from('boards').update({ title }).eq('id', boardId).then(({ error }) => { if (error) console.error(error) })
    }

    if (status === 'connecting') {
        return (
            <div className="h-screen dot-grid flex flex-col items-center justify-center gap-4">
                <div className="h-8 w-48 rounded-lg animate-shimmer" />
                <p className="text-sm text-white/30">Connecting...</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="h-screen dot-grid flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <p className="text-sm text-red-400/80">Failed to connect</p>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden dot-grid flex">
            <Sidebar
                boards={boards}
                selectedBoardId={selectedBoardId}
                onSelectBoard={setSelectedBoardId}
                onAddBoard={addBoard}
                onArchiveBoard={archiveBoard}
                onUpdateBoardTitle={updateBoardTitle}
            />
            {selectedBoardId ? (
                <BoardView key={selectedBoardId} boardId={selectedBoardId} />
            ) : (
                <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
                    Create a board to get started
                </div>
            )}
        </div>
    )
}

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { generateKeyBetween } from 'fractional-indexing'
import { enqueue } from './mutationQueue'
import type { Board } from './types'
import { LABEL_COLORS } from './types'

type ConnectionStatus = 'connecting' | 'connected' | 'error'

export function useBoards() {
    const [boards, setBoards] = useState<Board[]>([])
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
    const [status, setStatus] = useState<ConnectionStatus>('connecting')

    useEffect(() => {
        const createInitialBoard = () => {
            const id = crypto.randomUUID()
            const position = generateKeyBetween(null, null)
            setBoards([{ id, title: 'My Board', position, archived: false }])
            setSelectedBoardId(id)
            setStatus('connected')
            enqueue(async () => {
                const { error } = await supabase.from('boards').insert({ id, title: 'My Board', position })
                if (error) console.error(error)
            })
            enqueue(async () => {
                const { error } = await supabase.from('columns').update({ board_id: id }).is('board_id', null)
                if (error) console.error(error)
            })
        }

        const loadBoards = () => {
            supabase.from('boards').select('*').eq('archived', false).order('position')
                .then(({ data, error }) => {
                    if (error) { setStatus('error'); return }
                    if (!data || data.length === 0) {
                        createInitialBoard()
                    } else {
                        setBoards(data)
                        setSelectedBoardId(data[0].id)
                        setStatus('connected')
                    }
                })
        }

        loadBoards()

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

        return () => { channel.unsubscribe().catch(console.error) }
    }, [])

    const addBoard = () => {
        const lastPosition = boards[boards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        const title = `Board ${boards.length + 1}`
        setBoards((prev) => [...prev, { id, title, position, archived: false }])
        setSelectedBoardId(id)
        enqueue(async () => {
            const { error } = await supabase.from('boards').insert({ id, title, position })
            if (error) { console.error(error); return }
            const defaultLabels = LABEL_COLORS.map((c, i) => ({
                id: crypto.randomUUID(),
                board_id: id,
                title: '',
                color: c.key,
                position: `a${i}`,
            }))
            const { error: labelError } = await supabase.from('labels').insert(defaultLabels)
            if (labelError) console.error(labelError)
        })
    }

    const archiveBoard = (boardId: string) => {
        const remaining = boards.filter((b) => b.id !== boardId)
        setBoards(remaining)
        if (selectedBoardId === boardId) {
            setSelectedBoardId(remaining[0]?.id ?? null)
        }
        enqueue(async () => {
            const { error } = await supabase.from('boards').update({ archived: true }).eq('id', boardId)
            if (error) console.error(error)
        })
    }

    const updateBoardTitle = (boardId: string, title: string) => {
        setBoards((prev) => prev.map((b) => b.id === boardId ? { ...b, title } : b))
        enqueue(async () => {
            const { error } = await supabase.from('boards').update({ title }).eq('id', boardId)
            if (error) console.error(error)
        })
    }

    return { boards, selectedBoardId, status, setSelectedBoardId, addBoard, archiveBoard, updateBoardTitle }
}

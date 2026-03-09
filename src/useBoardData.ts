import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { enqueue } from './mutationQueue'
import { generateKeyBetween } from 'fractional-indexing'
import type { Column, Card, Label, CardLabel, Comment, ChecklistItem } from './types'

type RealtimePayload = {
    eventType: string
    old: Record<string, unknown>
    new: Record<string, unknown>
}

type LoadingStatus = 'loading' | 'ready' | 'error'

const byPosition = (a: { position: string }, b: { position: string }) =>
    a.position < b.position ? -1 : 1

function handleRealtimeChange<T extends { id: string }>(
    payload: RealtimePayload,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    options: {
        scopeCheck?: (item: T) => boolean
        isRemoved?: (item: T) => boolean
        sort?: (a: T, b: T) => number
        onDelete?: (deletedId: string) => void
    } = {}
) {
    if (payload.eventType === 'DELETE') {
        const deletedId = payload.old.id as string
        setter((prev) => prev.filter((item) => item.id !== deletedId))
        options.onDelete?.(deletedId)
        return
    }

    const item = payload.new as T
    if (options.scopeCheck && !options.scopeCheck(item)) return

    if (options.isRemoved?.(item)) {
        setter((prev) => prev.filter((x) => x.id !== item.id))
        return
    }

    setter((prev) => {
        const exists = prev.some((x) => x.id === item.id)
        const next = exists
            ? prev.map((x) => x.id === item.id ? item : x)
            : [...prev, item]
        return options.sort ? next.sort(options.sort) : next
    })
}

export function useBoardData(boardId: string) {
    const [columns, setColumns] = useState<Column[]>([])
    const [cards, setCards] = useState<Card[]>([])
    const [labels, setLabels] = useState<Label[]>([])
    const [cardLabels, setCardLabels] = useState<CardLabel[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
    const [status, setStatus] = useState<LoadingStatus>('loading')

    const columnIdsRef = useRef<Set<string>>(new Set())
    useEffect(() => { columnIdsRef.current = new Set(columns.map((c) => c.id)) }, [columns])

    const cardIdsRef = useRef<Set<string>>(new Set())
    useEffect(() => { cardIdsRef.current = new Set(cards.map((c) => c.id)) }, [cards])

    useEffect(() => {
        const loadData = async () => {
            const { data: cols, error: colErr } = await supabase
                .from('columns').select('*').eq('board_id', boardId).eq('archived', false).order('position')

            if (colErr) { setStatus('error'); return }
            const columnData = cols ?? []
            setColumns(columnData)

            const columnIds = columnData.map((c) => c.id)

            const [cardsRes, labelsRes] = await Promise.all([
                columnIds.length > 0
                    ? supabase.from('cards').select('*').in('column_id', columnIds).eq('archived', false).order('position')
                    : Promise.resolve({ data: [] as Card[], error: null }),
                supabase.from('labels').select('*').eq('board_id', boardId).order('position'),
            ])

            if (cardsRes.error || labelsRes.error) { setStatus('error'); return }
            const cardData = cardsRes.data ?? []
            setCards(cardData)
            setLabels(labelsRes.data ?? [])

            if (cardData.length > 0) {
                const cardIds = cardData.map((c) => c.id)
                const [clRes, ciRes] = await Promise.all([
                    supabase.from('card_labels').select('*').in('card_id', cardIds),
                    supabase.from('checklist_items').select('*').in('card_id', cardIds).order('position'),
                ])
                setCardLabels(clRes.data ?? [])
                setChecklistItems(ciRes.data ?? [])
            }

            setStatus('ready')
        }

        loadData()

        const channel = supabase
            .channel(`board-${boardId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` },
                (payload) => handleRealtimeChange(payload, setColumns, {
                    isRemoved: (col) => col.archived,
                    sort: byPosition,
                }),
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'cards' },
                (payload) => handleRealtimeChange(payload, setCards, {
                    scopeCheck: (card) => columnIdsRef.current.has(card.column_id),
                    isRemoved: (card) => card.archived,
                    sort: byPosition,
                }),
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'labels', filter: `board_id=eq.${boardId}` },
                (payload) => handleRealtimeChange(payload, setLabels, {
                    sort: byPosition,
                    onDelete: (labelId) => setCardLabels((prev) => prev.filter((cl) => cl.label_id !== labelId)),
                }),
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'card_labels' },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        const old = payload.old as CardLabel
                        setCardLabels((prev) =>
                            prev.filter((cl) => !(cl.card_id === old.card_id && cl.label_id === old.label_id))
                        )
                        return
                    }
                    const cl = payload.new as CardLabel
                    if (!cardIdsRef.current.has(cl.card_id)) return
                    setCardLabels((prev) => {
                        const exists = prev.some((x) => x.card_id === cl.card_id && x.label_id === cl.label_id)
                        return exists ? prev : [...prev, cl]
                    })
                },
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'checklist_items' },
                (payload) => handleRealtimeChange(payload, setChecklistItems, {
                    scopeCheck: (item) => cardIdsRef.current.has(item.card_id),
                    sort: byPosition,
                }),
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'comments' },
                (payload) => handleRealtimeChange(payload, setComments, {
                    scopeCheck: (comment) => cardIdsRef.current.has(comment.card_id),
                }),
            )
            .subscribe()

        return () => { channel.unsubscribe() }
    }, [boardId])

    // Query helpers
    const cardsForColumn = useCallback((columnId: string) =>
        cards
            .filter((c) => c.column_id === columnId)
            .sort(byPosition),
    [cards])

    const labelsForCard = useCallback((cardId: string): Label[] => {
        const labelIds = cardLabels.filter((cl) => cl.card_id === cardId).map((cl) => cl.label_id)
        return labels.filter((l) => labelIds.includes(l.id))
    }, [cardLabels, labels])

    const commentsForCard = useCallback((cardId: string) =>
        comments
            .filter((c) => c.card_id === cardId)
            .sort((a, b) => a.created_at < b.created_at ? -1 : 1),
    [comments])

    const checklistForCard = useCallback((cardId: string) =>
        checklistItems
            .filter((ci) => ci.card_id === cardId)
            .sort(byPosition),
    [checklistItems])

    const activeCommentLoadRef = useRef<string | null>(null)

    const loadCommentsForCard = useCallback((cardId: string) => {
        activeCommentLoadRef.current = cardId
        supabase.from('comments').select('*').eq('card_id', cardId).order('created_at')
            .then(({ data }) => {
                if (activeCommentLoadRef.current !== cardId) return
                if (data) setComments((prev) => {
                    const otherComments = prev.filter((c) => c.card_id !== cardId)
                    return [...otherComments, ...data]
                })
            })
    }, [])

    // Mutations
    const addColumn = () => {
        const lastPosition = columns[columns.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        const title = `Column ${columns.length + 1}`
        setColumns((prev) => [...prev, { id, board_id: boardId, title, position, archived: false }])
        enqueue(async () => {
            const { error } = await supabase.from('columns').insert({ id, board_id: boardId, title, position })
            if (error) console.error(error)
        })
    }

    const addCard = (columnId: string, title: string) => {
        const columnCards = cardsForColumn(columnId)
        const lastPosition = columnCards[columnCards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        setCards((prev) => [...prev, { id, column_id: columnId, title, description: '', position, archived: false, due_date: null, cover_color: null }])
        enqueue(async () => {
            const { error } = await supabase.from('cards').insert({ id, column_id: columnId, title, position })
            if (error) console.error(error)
        })
    }

    const archiveCard = (cardId: string) => {
        setCards((prev) => prev.filter((c) => c.id !== cardId))
        setCardLabels((prev) => prev.filter((cl) => cl.card_id !== cardId))
        setComments((prev) => prev.filter((c) => c.card_id !== cardId))
        setChecklistItems((prev) => prev.filter((ci) => ci.card_id !== cardId))
        enqueue(async () => {
            const { error } = await supabase.from('cards').update({ archived: true }).eq('id', cardId)
            if (error) console.error(error)
        })
    }

    const archiveColumn = (columnId: string) => {
        const removedCardIds = new Set(cards.filter((c) => c.column_id === columnId).map((c) => c.id))
        setColumns((prev) => prev.filter((c) => c.id !== columnId))
        setCards((prev) => prev.filter((c) => c.column_id !== columnId))
        setCardLabels((prev) => prev.filter((cl) => !removedCardIds.has(cl.card_id)))
        setComments((prev) => prev.filter((c) => !removedCardIds.has(c.card_id)))
        setChecklistItems((prev) => prev.filter((ci) => !removedCardIds.has(ci.card_id)))
        enqueue(async () => {
            const { error } = await supabase.from('columns').update({ archived: true }).eq('id', columnId)
            if (error) console.error(error)
        })
    }

    const updateCardTitle = (cardId: string, title: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, title } : c))
        enqueue(async () => {
            const { error } = await supabase.from('cards').update({ title }).eq('id', cardId)
            if (error) console.error(error)
        })
    }

    const updateCardDescription = (cardId: string, description: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, description } : c))
        enqueue(async () => {
            const { error } = await supabase.from('cards').update({ description }).eq('id', cardId)
            if (error) console.error(error)
        })
    }

    const updateCardDueDate = (cardId: string, dueDate: string | null) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, due_date: dueDate } : c))
        enqueue(async () => {
            const { error } = await supabase.from('cards').update({ due_date: dueDate }).eq('id', cardId)
            if (error) console.error(error)
        })
    }

    const updateCardCover = (cardId: string, coverColor: string | null) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, cover_color: coverColor } : c))
        enqueue(async () => {
            const { error } = await supabase.from('cards').update({ cover_color: coverColor }).eq('id', cardId)
            if (error) console.error(error)
        })
    }

    const updateColumnTitle = (columnId: string, title: string) => {
        setColumns((prev) => prev.map((c) => c.id === columnId ? { ...c, title } : c))
        enqueue(async () => {
            const { error } = await supabase.from('columns').update({ title }).eq('id', columnId)
            if (error) console.error(error)
        })
    }

    const moveCard = (cardId: string, targetColumnId: string, position: string) => {
        setCards((prev) =>
            prev.map((c) => c.id === cardId ? { ...c, column_id: targetColumnId, position } : c)
                .sort(byPosition)
        )
        enqueue(async () => {
            const { error } = await supabase.from('cards').update({ column_id: targetColumnId, position }).eq('id', cardId)
            if (error) console.error(error)
        })
    }

    const moveCardToColumn = (cardId: string, targetColumnId: string) => {
        const targetCards = cardsForColumn(targetColumnId)
        const lastPosition = targetCards[targetCards.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        moveCard(cardId, targetColumnId, position)
    }

    const moveCardLocally = (cardId: string, columnId: string) => {
        setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, column_id: columnId } : c))
    }

    const moveColumnLocally = (activeId: string, overId: string) => {
        setColumns((prev) => {
            const activeIndex = prev.findIndex((c) => c.id === activeId)
            const overIndex = prev.findIndex((c) => c.id === overId)
            if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return prev
            const next = [...prev]
            const [moved] = next.splice(activeIndex, 1)
            next.splice(overIndex, 0, moved)
            return next
        })
    }

    const moveColumn = (columnId: string, position: string) => {
        setColumns((prev) =>
            prev.map((c) => c.id === columnId ? { ...c, position } : c)
                .sort(byPosition)
        )
        enqueue(async () => {
            const { error } = await supabase.from('columns').update({ position }).eq('id', columnId)
            if (error) console.error(error)
        })
    }

    const updateLabelTitle = (labelId: string, title: string) => {
        setLabels((prev) => prev.map((l) => l.id === labelId ? { ...l, title } : l))
        enqueue(async () => {
            const { error } = await supabase.from('labels').update({ title }).eq('id', labelId)
            if (error) console.error(error)
        })
    }

    const toggleCardLabel = (cardId: string, labelId: string) => {
        const exists = cardLabels.some((cl) => cl.card_id === cardId && cl.label_id === labelId)
        if (exists) {
            setCardLabels((prev) => prev.filter((cl) => !(cl.card_id === cardId && cl.label_id === labelId)))
            enqueue(async () => {
                const { error } = await supabase.from('card_labels').delete().eq('card_id', cardId).eq('label_id', labelId)
                if (error) console.error(error)
            })
        } else {
            setCardLabels((prev) => [...prev, { card_id: cardId, label_id: labelId }])
            enqueue(async () => {
                const { error } = await supabase.from('card_labels').insert({ card_id: cardId, label_id: labelId })
                if (error) console.error(error)
            })
        }
    }

    const addComment = (cardId: string, content: string) => {
        const id = crypto.randomUUID()
        const comment: Comment = { id, card_id: cardId, author_name: 'You', content, created_at: new Date().toISOString() }
        setComments((prev) => [...prev, comment])
        enqueue(async () => {
            const { error } = await supabase.from('comments').insert({ id, card_id: cardId, author_name: 'You', content })
            if (error) console.error(error)
        })
    }

    const addChecklistItem = (cardId: string, title: string) => {
        const cardItems = checklistForCard(cardId)
        const lastPosition = cardItems[cardItems.length - 1]?.position ?? null
        const position = generateKeyBetween(lastPosition, null)
        const id = crypto.randomUUID()
        setChecklistItems((prev) => [...prev, { id, card_id: cardId, title, checked: false, position }])
        enqueue(async () => {
            const { error } = await supabase.from('checklist_items').insert({ id, card_id: cardId, title, position })
            if (error) console.error(error)
        })
    }

    const toggleChecklistItem = (itemId: string) => {
        const item = checklistItems.find((ci) => ci.id === itemId)
        if (!item) return
        const checked = !item.checked
        setChecklistItems((prev) => prev.map((ci) => ci.id === itemId ? { ...ci, checked } : ci))
        enqueue(async () => {
            const { error } = await supabase.from('checklist_items').update({ checked }).eq('id', itemId)
            if (error) console.error(error)
        })
    }

    const updateChecklistItemTitle = (itemId: string, title: string) => {
        setChecklistItems((prev) => prev.map((ci) => ci.id === itemId ? { ...ci, title } : ci))
        enqueue(async () => {
            const { error } = await supabase.from('checklist_items').update({ title }).eq('id', itemId)
            if (error) console.error(error)
        })
    }

    const deleteChecklistItem = (itemId: string) => {
        setChecklistItems((prev) => prev.filter((ci) => ci.id !== itemId))
        enqueue(async () => {
            const { error } = await supabase.from('checklist_items').delete().eq('id', itemId)
            if (error) console.error(error)
        })
    }

    return {
        columns, cards, labels, cardLabels, comments, checklistItems, status,
        cardsForColumn, labelsForCard, commentsForCard, checklistForCard, loadCommentsForCard,
        addColumn, addCard, archiveCard, archiveColumn,
        updateCardTitle, updateCardDescription, updateCardDueDate, updateCardCover,
        updateColumnTitle, updateLabelTitle,
        moveCard, moveCardToColumn, moveCardLocally, moveColumnLocally, moveColumn,
        toggleCardLabel, addComment,
        addChecklistItem, toggleChecklistItem, updateChecklistItemTitle, deleteChecklistItem,
    }
}

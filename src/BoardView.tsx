import { useCallback, useEffect, useMemo, useState } from 'react'
import { Board } from './Board'
import { Presence } from './Presence'
import { CardDetailModal } from './CardDetailModal'
import { QuickEditPopup } from './QuickEditPopup'
import { HelpOverlay } from './HelpOverlay'
import { useBoardData } from './useBoardData'

type BoardViewProps = {
    boardId: string
}

export function BoardView({ boardId }: BoardViewProps) {
    const data = useBoardData(boardId)
    const { columns, cards, labels, cardLabels, status } = data

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
    const [quickEditState, setQuickEditState] = useState<{ cardId: string; rect: DOMRect } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showHelp, setShowHelp] = useState(false)
    const [quickEditShowLabels, setQuickEditShowLabels] = useState(false)

    const selectedCard = selectedCardId ? cards.find((c) => c.id === selectedCardId) ?? null : null

    // Search filtering
    const searchLower = searchQuery.toLowerCase().trim()
    const matchingCardIds = useMemo(() => {
        if (!searchLower) return null
        return new Set(
            cards
                .filter((c) => {
                    if (c.title.toLowerCase().includes(searchLower)) return true
                    if (c.description.toLowerCase().includes(searchLower)) return true
                    const cardLabelNames = cardLabels
                        .filter((cl) => cl.card_id === c.id)
                        .map((cl) => labels.find((l) => l.id === cl.label_id)?.title ?? '')
                    return cardLabelNames.some((name) => name.toLowerCase().includes(searchLower))
                })
                .map((c) => c.id)
        )
    }, [searchLower, cards, cardLabels, labels])

    const filteredCardsForColumn = useCallback((columnId: string) =>
        data.cardsForColumn(columnId)
            .filter((c) => !matchingCardIds || matchingCardIds.has(c.id)),
    [data.cardsForColumn, matchingCardIds])

    // Load comments when a card is selected
    useEffect(() => {
        if (selectedCardId) data.loadCommentsForCard(selectedCardId)
    }, [selectedCardId, data.loadCommentsForCard])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (document.activeElement as HTMLElement)?.tagName
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
            if (selectedCardId || quickEditState) return

            switch (e.key) {
                case 'n': {
                    e.preventDefault()
                    const addBtn = document.querySelector('[data-add-card-btn]') as HTMLElement | null
                    addBtn?.click()
                    break
                }
                case 'e': {
                    e.preventDefault()
                    const hoveredEl = document.querySelector('[data-card-id]:hover') as HTMLElement | null
                    if (hoveredEl) {
                        const cardId = hoveredEl.dataset.cardId!
                        setQuickEditState({ cardId, rect: hoveredEl.getBoundingClientRect() })
                        setQuickEditShowLabels(false)
                    }
                    break
                }
                case 'l': {
                    e.preventDefault()
                    const hoveredEl = document.querySelector('[data-card-id]:hover') as HTMLElement | null
                    if (hoveredEl) {
                        const cardId = hoveredEl.dataset.cardId!
                        setQuickEditState({ cardId, rect: hoveredEl.getBoundingClientRect() })
                        setQuickEditShowLabels(true)
                    }
                    break
                }
                case '?': {
                    e.preventDefault()
                    setShowHelp((prev) => !prev)
                    break
                }
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [selectedCardId, quickEditState])

    const handleArchiveCard = (cardId: string) => {
        data.archiveCard(cardId)
        if (selectedCardId === cardId) setSelectedCardId(null)
    }

    if (status === 'loading') {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="h-6 w-36 rounded-lg animate-shimmer" />
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex-1 flex items-center justify-center text-red-400/80 text-sm">
                Failed to load board
            </div>
        )
    }

    const selectedCardLabelIds = selectedCard
        ? new Set(cardLabels.filter((cl) => cl.card_id === selectedCard.id).map((cl) => cl.label_id))
        : new Set<string>()

    const quickEditCard = quickEditState ? cards.find((c) => c.id === quickEditState.cardId) ?? null : null
    const quickEditLabelIds = quickEditCard
        ? new Set(cardLabels.filter((cl) => cl.card_id === quickEditCard.id).map((cl) => cl.label_id))
        : new Set<string>()

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-ping opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                        <span className="text-[11px] font-medium text-accent">LIVE</span>
                    </div>
                    <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); (e.target as HTMLElement).blur() } }}
                            placeholder="Filter cards..."
                            className="w-48 pl-8 pr-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[12px] text-white/70 outline-none placeholder:text-white/15 focus:border-accent/30 focus:bg-white/[0.06] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {matchingCardIds && (
                        <span className="text-[11px] text-white/25">{matchingCardIds.size} found</span>
                    )}
                </div>
                <Presence />
            </header>
            <div className="flex-1 p-6 overflow-hidden">
                <Board
                    columns={columns}
                    cards={cards}
                    cardsForColumn={filteredCardsForColumn}
                    labelsForCard={data.labelsForCard}
                    checklistForCard={data.checklistForCard}
                    onAddColumn={data.addColumn}
                    onAddCard={data.addCard}
                    onArchiveColumn={data.archiveColumn}
                    onUpdateColumnTitle={data.updateColumnTitle}
                    onQuickEdit={(cardId, rect) => setQuickEditState({ cardId, rect })}
                    onMoveCard={data.moveCard}
                    onMoveCardLocally={data.moveCardLocally}
                    onMoveColumn={data.moveColumn}
                    onMoveColumnLocally={data.moveColumnLocally}
                    onCardClick={setSelectedCardId}
                />
            </div>
            {quickEditCard && quickEditState && (
                <QuickEditPopup
                    card={quickEditCard}
                    rect={quickEditState.rect}
                    columns={columns}
                    labels={labels}
                    cardLabelIds={quickEditLabelIds}
                    initialShowLabels={quickEditShowLabels}
                    onUpdateTitle={(title) => data.updateCardTitle(quickEditCard.id, title)}
                    onMoveToColumn={(columnId) => data.moveCardToColumn(quickEditCard.id, columnId)}
                    onToggleLabel={(labelId) => data.toggleCardLabel(quickEditCard.id, labelId)}
                    onUpdateLabelTitle={data.updateLabelTitle}
                    onArchive={() => { handleArchiveCard(quickEditCard.id); setQuickEditState(null) }}
                    onOpenDetail={() => { setQuickEditState(null); setQuickEditShowLabels(false); setSelectedCardId(quickEditCard.id) }}
                    onClose={() => { setQuickEditState(null); setQuickEditShowLabels(false) }}
                />
            )}
            {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    columns={columns}
                    labels={labels}
                    cardLabelIds={selectedCardLabelIds}
                    comments={data.commentsForCard(selectedCard.id)}
                    checklistItems={data.checklistForCard(selectedCard.id)}
                    onAddChecklistItem={(title) => data.addChecklistItem(selectedCard.id, title)}
                    onToggleChecklistItem={data.toggleChecklistItem}
                    onUpdateChecklistItemTitle={data.updateChecklistItemTitle}
                    onDeleteChecklistItem={data.deleteChecklistItem}
                    onUpdateTitle={(title) => data.updateCardTitle(selectedCard.id, title)}
                    onUpdateDescription={(desc) => data.updateCardDescription(selectedCard.id, desc)}
                    onUpdateDueDate={(date) => data.updateCardDueDate(selectedCard.id, date)}
                    onUpdateCover={(color) => data.updateCardCover(selectedCard.id, color)}
                    onMoveToColumn={(columnId) => data.moveCardToColumn(selectedCard.id, columnId)}
                    onToggleLabel={(labelId) => data.toggleCardLabel(selectedCard.id, labelId)}
                    onUpdateLabelTitle={data.updateLabelTitle}
                    onAddComment={(content) => data.addComment(selectedCard.id, content)}
                    onArchive={() => handleArchiveCard(selectedCard.id)}
                    onClose={() => setSelectedCardId(null)}
                />
            )}
        </div>
    )
}

import { Sidebar } from './Sidebar'
import { BoardView } from './BoardView'
import { useBoards } from './useBoards'

export function App() {
    const { boards, selectedBoardId, status, setSelectedBoardId,
        addBoard, archiveBoard, updateBoardTitle } = useBoards()

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

type HelpOverlayProps = {
    onClose: () => void
}

const SHORTCUTS = [
    ['N', 'New card'],
    ['E', 'Edit hovered card'],
    ['L', 'Labels on hovered card'],
    ['Esc', 'Close modal / popup'],
    ['?', 'Toggle this help'],
]

export function HelpOverlay({ onClose }: HelpOverlayProps) {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-white/[0.08] rounded-xl shadow-2xl p-6 w-72"
            >
                <h3 className="text-sm font-semibold text-white/80 mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-2.5">
                    {SHORTCUTS.map(([key, desc]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-[12px] text-white/50">{desc}</span>
                            <kbd className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded text-[11px] font-mono text-white/60">{key}</kbd>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

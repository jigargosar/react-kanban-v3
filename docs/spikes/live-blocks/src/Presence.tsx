import { useOthers, useSelf } from '@liveblocks/react/suspense'

export function Presence() {
    const self = useSelf()
    const others = useOthers()

    return (
        <div className="mb-6 text-sm text-gray-400">
            <p>
                You: {self.connectionId}
                {self.presence.isDragging && ` (dragging: ${self.presence.isDragging})`}
            </p>
            <p>
                {others.length === 0
                    ? 'No one else is here'
                    : `${others.length} other${others.length > 1 ? 's' : ''} connected: ${others.map((o) => o.connectionId).join(', ')}`}
            </p>
        </div>
    )
}

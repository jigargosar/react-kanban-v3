import { useState, useEffect } from 'react'
import { useStorage, useMutation } from '@liveblocks/react/suspense'

type PendingAction = { type: 'up' | 'down'; index: number; fireAt: number }

export function ReorderList() {
    const items = useStorage((root) => root.items)
    const [pending, setPending] = useState<PendingAction | null>(null)
    const [countdown, setCountdown] = useState(0)

    const moveUp = useMutation(({ storage }, index: number) => {
        if (index === 0) return
        storage.get('items').move(index, index - 1)
    }, [])

    const moveDown = useMutation(({ storage }, index: number) => {
        const list = storage.get('items')
        if (index === list.length - 1) return
        list.move(index, index + 1)
    }, [])

    const deleteItem = useMutation(({ storage }, index: number) => {
        storage.get('items').delete(index)
    }, [])

    const addItem = useMutation(({ storage }, text: string) => {
        storage.get('items').push(text)
    }, [])

    const scheduleMove = (type: 'up' | 'down', index: number) => {
        setPending({ type, index, fireAt: Date.now() + 3000 })
        setCountdown(3)
    }

    useEffect(() => {
        if (!pending) return
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((pending.fireAt - Date.now()) / 1000))
            setCountdown(remaining)
            if (remaining === 0) {
                if (pending.type === 'up') moveUp(pending.index)
                else moveDown(pending.index)
                setPending(null)
                clearInterval(interval)
            }
        }, 100)
        return () => clearInterval(interval)
    }, [pending, moveUp, moveDown])

    return (
        <div className="max-w-md space-y-2">
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-center gap-2 bg-gray-900 rounded-lg p-3 text-white"
                    >
                        <span className="flex-1">{item}</span>
                        <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="px-2 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-30"
                        >
                            ↑
                        </button>
                        <button
                            onClick={() => moveDown(index)}
                            disabled={index === items.length - 1}
                            className="px-2 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-30"
                        >
                            ↓
                        </button>
                        <button
                            onClick={() => deleteItem(index)}
                            className="px-2 py-1 text-sm bg-red-900 rounded hover:bg-red-800"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => addItem(`Task ${items.length + 1}`)}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
            >
                Add Item
            </button>

            {pending && (
                <div className="text-yellow-400 font-mono text-lg">
                    Firing {pending.type} on item {pending.index} in {countdown}s...
                </div>
            )}

            <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-500 text-sm mb-2">
                    Conflict test: click a delayed move in both tabs, they fire simultaneously after 3s
                </p>
                <div className="flex gap-2 flex-wrap">
                    {items.map((_item, index) => (
                        <div key={index} className="flex gap-1">
                            <button
                                onClick={() => scheduleMove('up', index)}
                                disabled={index === 0 || pending !== null}
                                className="px-2 py-1 text-xs bg-yellow-900 text-yellow-200 rounded hover:bg-yellow-800 disabled:opacity-30"
                            >
                                {index}↑ 3s
                            </button>
                            <button
                                onClick={() => scheduleMove('down', index)}
                                disabled={index === items.length - 1 || pending !== null}
                                className="px-2 py-1 text-xs bg-yellow-900 text-yellow-200 rounded hover:bg-yellow-800 disabled:opacity-30"
                            >
                                {index}↓ 3s
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

import { generateKeyBetween } from 'fractional-indexing'
import { supabase } from './supabase'

type Item = { id: string; text: string; position: string }

type ReorderListProps = {
    items: Item[]
    setItems: React.Dispatch<React.SetStateAction<Item[]>>
}

export function ReorderList({ items, setItems }: ReorderListProps) {
    const moveUp = (index: number) => {
        if (index === 0) return
        const item = items[index]
        const before = items[index - 2]?.position ?? null
        const after = items[index - 1].position
        const newPosition = generateKeyBetween(before, after)

        setItems((prev) =>
            prev.map((i) => i.id === item.id ? { ...i, position: newPosition } : i)
                .sort((a, b) => a.position < b.position ? -1 : 1)
        )

        supabase.from('spike_items').update({ position: newPosition }).eq('id', item.id).then()
    }

    const moveDown = (index: number) => {
        if (index === items.length - 1) return
        const item = items[index]
        const before = items[index + 1].position
        const after = items[index + 2]?.position ?? null
        const newPosition = generateKeyBetween(before, after)

        setItems((prev) =>
            prev.map((i) => i.id === item.id ? { ...i, position: newPosition } : i)
                .sort((a, b) => a.position < b.position ? -1 : 1)
        )

        supabase.from('spike_items').update({ position: newPosition }).eq('id', item.id).then()
    }

    const deleteItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
        supabase.from('spike_items').delete().eq('id', id).then()
    }

    const addItem = () => {
        const lastPosition = items[items.length - 1]?.position ?? null
        const newPosition = generateKeyBetween(lastPosition, null)
        const text = `Task ${items.length + 1}`
        const id = crypto.randomUUID()

        setItems((prev) => [...prev, { id, text, position: newPosition }])
        supabase.from('spike_items').insert({ id, text, position: newPosition }).then()
    }

    return (
        <div className="max-w-md space-y-2">
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li
                        key={item.id}
                        className="flex items-center gap-2 bg-gray-900 rounded-lg p-3 text-white"
                    >
                        <span className="flex-1">{item.text}</span>
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
                            onClick={() => deleteItem(item.id)}
                            className="px-2 py-1 text-sm bg-red-900 rounded hover:bg-red-800"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onClick={addItem}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
            >
                Add Item
            </button>
        </div>
    )
}

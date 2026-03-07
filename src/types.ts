type BoardId = string
type ColumnId = string
type CardId = string
type LabelId = string
type Position = string

export type Board = {
    id: BoardId
    title: string
    position: Position
    archived: boolean
}

export type Column = {
    id: ColumnId
    board_id: BoardId
    title: string
    position: Position
    archived: boolean
}

export type Card = {
    id: CardId
    column_id: ColumnId
    title: string
    description: string
    position: Position
    archived: boolean
    due_date: string | null
}

export type Label = {
    id: LabelId
    board_id: BoardId
    title: string
    color: string
    position: Position
}

export type CardLabel = {
    card_id: CardId
    label_id: LabelId
}

export const LABEL_COLORS: { key: string; bg: string; dot: string; name: string }[] = [
    { key: 'green',  bg: 'bg-emerald-400/15', dot: 'bg-emerald-400', name: 'Green' },
    { key: 'yellow', bg: 'bg-yellow-400/15',  dot: 'bg-yellow-400',  name: 'Yellow' },
    { key: 'orange', bg: 'bg-orange-400/15',  dot: 'bg-orange-400',  name: 'Orange' },
    { key: 'red',    bg: 'bg-red-400/15',     dot: 'bg-red-400',     name: 'Red' },
    { key: 'purple', bg: 'bg-violet-400/15',  dot: 'bg-violet-400',  name: 'Purple' },
    { key: 'blue',   bg: 'bg-blue-400/15',    dot: 'bg-blue-400',    name: 'Blue' },
]

export function labelDotClass(color: string): string {
    return LABEL_COLORS.find((c) => c.key === color)?.dot ?? 'bg-gray-400'
}

export function labelBgClass(color: string): string {
    return LABEL_COLORS.find((c) => c.key === color)?.bg ?? 'bg-gray-400/15'
}

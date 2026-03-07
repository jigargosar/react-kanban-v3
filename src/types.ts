type ColumnId = string
type CardId = string
type Position = string

export type Column = {
    id: ColumnId
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
}

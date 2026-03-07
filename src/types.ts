type BoardId = string
type ColumnId = string
type CardId = string
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
}

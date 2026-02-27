export interface TodoModule {
  id: string
  name: string
  defaultItems: string[]
}

export interface ProjectType {
  id: string
  name: string
  color: string
  moduleIds: string[]
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  moduleId: string // module ID or 'general'
}

export type ColumnId = 'todo' | 'in-progress' | 'done'

export interface Card {
  id: string
  title: string
  description: string
  projectTypeId: string
  columnId: ColumnId
  todoItems: TodoItem[]
  createdAt: string
}

export interface Column {
  id: ColumnId
  title: string
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: '할 일' },
  { id: 'in-progress', title: '진행 중' },
  { id: 'done', title: '완료' },
]

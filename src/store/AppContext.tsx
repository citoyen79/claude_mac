import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  TodoModule,
  ProjectType,
  Card,
  ColumnId,
  TodoItem,
} from '../types'
import { defaultModules, defaultProjectTypes } from './defaultData'

export interface AppState {
  modules: TodoModule[]
  projectTypes: ProjectType[]
  cards: Card[]
  view: 'board' | 'settings'
}

type Action =
  // Modules
  | { type: 'ADD_MODULE'; payload: { name: string; defaultItems: string[] } }
  | { type: 'UPDATE_MODULE'; payload: TodoModule }
  | { type: 'DELETE_MODULE'; payload: string }
  // Project Types
  | {
      type: 'ADD_PROJECT_TYPE'
      payload: { name: string; color: string; moduleIds: string[] }
    }
  | { type: 'UPDATE_PROJECT_TYPE'; payload: ProjectType }
  | { type: 'DELETE_PROJECT_TYPE'; payload: string }
  // Cards
  | {
      type: 'ADD_CARD'
      payload: { title: string; projectTypeId: string; columnId: ColumnId }
    }
  | { type: 'UPDATE_CARD'; payload: Partial<Card> & { id: string } }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; columnId: ColumnId } }
  // Todo Items
  | {
      type: 'TOGGLE_TODO_ITEM'
      payload: { cardId: string; itemId: string }
    }
  | {
      type: 'ADD_TODO_ITEM'
      payload: { cardId: string; text: string; moduleId: string }
    }
  | {
      type: 'UPDATE_TODO_ITEM'
      payload: { cardId: string; itemId: string; text: string }
    }
  | {
      type: 'DELETE_TODO_ITEM'
      payload: { cardId: string; itemId: string }
    }
  // Navigation
  | { type: 'SET_VIEW'; payload: 'board' | 'settings' }

const STORAGE_KEY = 'taskboard-app-v1'

function generateTodoItems(
  modules: TodoModule[],
  moduleIds: string[]
): TodoItem[] {
  const items: TodoItem[] = []
  moduleIds.forEach((moduleId) => {
    const module = modules.find((m) => m.id === moduleId)
    if (module) {
      module.defaultItems.forEach((text) => {
        items.push({
          id: uuidv4(),
          text,
          completed: false,
          moduleId,
        })
      })
    }
  })
  return items
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_MODULE':
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            id: uuidv4(),
            name: action.payload.name,
            defaultItems: action.payload.defaultItems,
          },
        ],
      }
    case 'UPDATE_MODULE':
      return {
        ...state,
        modules: state.modules.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      }
    case 'DELETE_MODULE':
      return {
        ...state,
        modules: state.modules.filter((m) => m.id !== action.payload),
        projectTypes: state.projectTypes.map((pt) => ({
          ...pt,
          moduleIds: pt.moduleIds.filter((id) => id !== action.payload),
        })),
      }
    case 'ADD_PROJECT_TYPE':
      return {
        ...state,
        projectTypes: [
          ...state.projectTypes,
          {
            id: uuidv4(),
            name: action.payload.name,
            color: action.payload.color,
            moduleIds: action.payload.moduleIds,
          },
        ],
      }
    case 'UPDATE_PROJECT_TYPE':
      return {
        ...state,
        projectTypes: state.projectTypes.map((pt) =>
          pt.id === action.payload.id ? action.payload : pt
        ),
      }
    case 'DELETE_PROJECT_TYPE':
      return {
        ...state,
        projectTypes: state.projectTypes.filter(
          (pt) => pt.id !== action.payload
        ),
      }
    case 'ADD_CARD': {
      const projectType = state.projectTypes.find(
        (pt) => pt.id === action.payload.projectTypeId
      )
      const todoItems = projectType
        ? generateTodoItems(state.modules, projectType.moduleIds)
        : []
      return {
        ...state,
        cards: [
          ...state.cards,
          {
            id: uuidv4(),
            title: action.payload.title,
            description: '',
            projectTypeId: action.payload.projectTypeId,
            columnId: action.payload.columnId,
            todoItems,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    }
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.payload),
      }
    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.cardId
            ? { ...c, columnId: action.payload.columnId }
            : c
        ),
      }
    case 'TOGGLE_TODO_ITEM':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.cardId
            ? {
                ...c,
                todoItems: c.todoItems.map((item) =>
                  item.id === action.payload.itemId
                    ? { ...item, completed: !item.completed }
                    : item
                ),
              }
            : c
        ),
      }
    case 'ADD_TODO_ITEM':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.cardId
            ? {
                ...c,
                todoItems: [
                  ...c.todoItems,
                  {
                    id: uuidv4(),
                    text: action.payload.text,
                    completed: false,
                    moduleId: action.payload.moduleId,
                  },
                ],
              }
            : c
        ),
      }
    case 'UPDATE_TODO_ITEM':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.cardId
            ? {
                ...c,
                todoItems: c.todoItems.map((item) =>
                  item.id === action.payload.itemId
                    ? { ...item, text: action.payload.text }
                    : item
                ),
              }
            : c
        ),
      }
    case 'DELETE_TODO_ITEM':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.cardId
            ? {
                ...c,
                todoItems: c.todoItems.filter(
                  (item) => item.id !== action.payload.itemId
                ),
              }
            : c
        ),
      }
    case 'SET_VIEW':
      return { ...state, view: action.payload }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextType | null>(null)

function loadState(): AppState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as AppState) : null
  } catch {
    return null
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const initialState: AppState = {
  modules: defaultModules,
  projectTypes: defaultProjectTypes,
  cards: [],
  view: 'board',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, loadState() ?? initialState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

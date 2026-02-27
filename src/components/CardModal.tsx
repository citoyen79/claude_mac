import { useState, useRef, useEffect } from 'react'
import { useApp } from '../store/AppContext'
import { Card, TodoItem, TodoModule, COLUMNS } from '../types'

interface Props {
  card: Card
  onClose: () => void
}

export function CardModal({ card, onClose }: Props) {
  const { state, dispatch } = useApp()
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [showAddItem, setShowAddItem] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const projectType = state.projectTypes.find(
    (pt) => pt.id === card.projectTypeId
  )

  // Modules from project type (ordered)
  const typeModules: TodoModule[] = projectType
    ? projectType.moduleIds
        .map((id) => state.modules.find((m) => m.id === id))
        .filter((m): m is TodoModule => m !== undefined)
    : []
  const typeModuleIdSet = new Set(typeModules.map((m) => m.id))

  // Items grouped by moduleId
  const itemsByModuleId: Record<string, TodoItem[]> = {}
  const otherItems: TodoItem[] = []

  card.todoItems.forEach((item) => {
    if (typeModuleIdSet.has(item.moduleId)) {
      if (!itemsByModuleId[item.moduleId]) {
        itemsByModuleId[item.moduleId] = []
      }
      itemsByModuleId[item.moduleId].push(item)
    } else {
      otherItems.push(item)
    }
  })

  const totalItems = card.todoItems.length
  const completedItems = card.todoItems.filter((i) => i.completed).length
  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const isComplete = totalItems > 0 && completedItems === totalItems

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  // Sync title/description when card prop changes
  useEffect(() => {
    setTitle(card.title)
  }, [card.title])
  useEffect(() => {
    setDescription(card.description)
  }, [card.description])

  function handleTitleSave() {
    if (title.trim()) {
      dispatch({
        type: 'UPDATE_CARD',
        payload: { id: card.id, title: title.trim() },
      })
    } else {
      setTitle(card.title)
    }
    setEditingTitle(false)
  }

  function handleDescriptionBlur() {
    dispatch({
      type: 'UPDATE_CARD',
      payload: { id: card.id, description },
    })
  }

  function handleDeleteCard() {
    if (confirm(`"${card.title}" 카드를 삭제하시겠습니까?`)) {
      dispatch({ type: 'DELETE_CARD', payload: card.id })
      onClose()
    }
  }

  function handleAddItem(moduleId: string) {
    const text = newItemTexts[moduleId]?.trim()
    if (text) {
      dispatch({
        type: 'ADD_TODO_ITEM',
        payload: { cardId: card.id, text, moduleId },
      })
      setNewItemTexts((prev) => ({ ...prev, [moduleId]: '' }))
      setShowAddItem(null)
    }
  }

  function handleUpdateItem(itemId: string, text: string) {
    if (text.trim()) {
      dispatch({
        type: 'UPDATE_TODO_ITEM',
        payload: { cardId: card.id, itemId, text: text.trim() },
      })
    }
    setEditingItemId(null)
  }

  function handleDeleteItem(itemId: string) {
    dispatch({
      type: 'DELETE_TODO_ITEM',
      payload: { cardId: card.id, itemId },
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex-1 mr-4">
            {projectType && (
              <div
                className="text-xs text-white font-bold px-2.5 py-1 rounded-full inline-block mb-2.5"
                style={{ backgroundColor: projectType.color }}
              >
                {projectType.name}
              </div>
            )}
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') {
                    setTitle(card.title)
                    setEditingTitle(false)
                  }
                }}
                className="text-xl font-bold text-gray-900 w-full border-2 border-blue-400 rounded-lg px-3 py-1.5 focus:outline-none"
              />
            ) : (
              <h2
                className="text-xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-1.5 -mx-3 -my-1.5 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="클릭하여 편집"
              >
                {card.title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="카드에 대한 설명을 입력하세요..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-blue-400 resize-none bg-gray-50 focus:bg-white transition-colors"
              rows={3}
            />
          </div>

          {/* Progress */}
          {totalItems > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  진행률
                </label>
                <span
                  className={`text-xs font-bold ${
                    isComplete ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {isComplete ? '완료!' : `${progress}% (${completedItems}/${totalItems})`}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: isComplete ? '#00875a' : '#0052cc',
                  }}
                />
              </div>
            </div>
          )}

          {/* Move to column */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              상태
            </label>
            <div className="flex gap-2">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() =>
                    dispatch({
                      type: 'MOVE_CARD',
                      payload: { cardId: card.id, columnId: col.id },
                    })
                  }
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    card.columnId === col.id
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          {/* Todo Items by Module */}
          {typeModules.map((module) => {
            const items = itemsByModuleId[module.id] ?? []
            const moduleCompleted = items.filter((i) => i.completed).length

            return (
              <div
                key={module.id}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                    {module.name}
                    <span className="text-xs text-gray-400 font-normal bg-white px-1.5 py-0.5 rounded-full border border-gray-200">
                      {moduleCompleted}/{items.length}
                    </span>
                  </h4>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <TodoItemRow
                      key={item.id}
                      item={item}
                      isEditing={editingItemId === item.id}
                      onToggle={() =>
                        dispatch({
                          type: 'TOGGLE_TODO_ITEM',
                          payload: { cardId: card.id, itemId: item.id },
                        })
                      }
                      onEdit={() => setEditingItemId(item.id)}
                      onSave={(text) => handleUpdateItem(item.id, text)}
                      onDelete={() => handleDeleteItem(item.id)}
                    />
                  ))}
                </div>

                {showAddItem === module.id ? (
                  <div className="flex gap-2 mt-2.5">
                    <input
                      autoFocus
                      value={newItemTexts[module.id] ?? ''}
                      onChange={(e) =>
                        setNewItemTexts((prev) => ({
                          ...prev,
                          [module.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddItem(module.id)
                        if (e.key === 'Escape') setShowAddItem(null)
                      }}
                      placeholder="할일 입력 후 Enter..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => handleAddItem(module.id)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 font-medium"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => setShowAddItem(null)}
                      className="px-3 py-1.5 text-gray-400 hover:text-gray-600 rounded-lg text-sm"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddItem(module.id)}
                    className="mt-2 text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                  >
                    <span>＋</span> 항목 추가
                  </button>
                )}
              </div>
            )
          })}

          {/* Other / general items */}
          {(otherItems.length > 0 || typeModules.length === 0) && (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                기타
                <span className="text-xs text-gray-400 font-normal bg-white px-1.5 py-0.5 rounded-full border border-gray-200">
                  {otherItems.filter((i) => i.completed).length}/
                  {otherItems.length}
                </span>
              </h4>
              <div className="space-y-1.5">
                {otherItems.map((item) => (
                  <TodoItemRow
                    key={item.id}
                    item={item}
                    isEditing={editingItemId === item.id}
                    onToggle={() =>
                      dispatch({
                        type: 'TOGGLE_TODO_ITEM',
                        payload: { cardId: card.id, itemId: item.id },
                      })
                    }
                    onEdit={() => setEditingItemId(item.id)}
                    onSave={(text) => handleUpdateItem(item.id, text)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </div>

              {showAddItem === 'general' ? (
                <div className="flex gap-2 mt-2.5">
                  <input
                    autoFocus
                    value={newItemTexts['general'] ?? ''}
                    onChange={(e) =>
                      setNewItemTexts((prev) => ({
                        ...prev,
                        general: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItem('general')
                      if (e.key === 'Escape') setShowAddItem(null)
                    }}
                    placeholder="할일 입력 후 Enter..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => handleAddItem('general')}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 font-medium"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setShowAddItem(null)}
                    className="px-3 py-1.5 text-gray-400 hover:text-gray-600 rounded-lg text-sm"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddItem('general')}
                  className="mt-2 text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  <span>＋</span> 항목 추가
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={handleDeleteCard}
            className="px-4 py-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            카드 삭제
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

// Sub-component for individual todo items
interface TodoItemRowProps {
  item: TodoItem
  isEditing: boolean
  onToggle: () => void
  onEdit: () => void
  onSave: (text: string) => void
  onDelete: () => void
}

function TodoItemRow({
  item,
  isEditing,
  onToggle,
  onEdit,
  onSave,
  onDelete,
}: TodoItemRowProps) {
  const [editText, setEditText] = useState(item.text)

  useEffect(() => {
    setEditText(item.text)
  }, [item.text])

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => onSave(editText)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(editText)
            if (e.key === 'Escape') onSave(item.text)
          }}
          className="flex-1 border-2 border-blue-400 rounded-lg px-2.5 py-1 text-sm focus:outline-none bg-white"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 group py-0.5">
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="w-4 h-4 rounded accent-blue-500 cursor-pointer shrink-0"
      />
      <span
        className={`flex-1 text-sm cursor-pointer rounded px-1 py-0.5 hover:bg-white transition-colors ${
          item.completed
            ? 'line-through text-gray-400'
            : 'text-gray-700'
        }`}
        onClick={onEdit}
        title="클릭하여 편집"
      >
        {item.text}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-sm transition-all w-5 h-5 flex items-center justify-center rounded shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

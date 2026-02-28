import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { TodoModule, ProjectType } from '../types'

type Tab = 'modules' | 'project-types'

export function Settings() {
  const [tab, setTab] = useState<Tab>('modules')

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">설정</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setTab('modules')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'modules'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            할일 모듈
          </button>
          <button
            onClick={() => setTab('project-types')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'project-types'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            프로젝트 유형
          </button>
        </div>

        {tab === 'modules' && <ModulesSettings />}
        {tab === 'project-types' && <ProjectTypesSettings />}
      </div>
    </div>
  )
}

// ─── Modules Settings ────────────────────────────────────────────────────────

function ModulesSettings() {
  const { state, dispatch } = useApp()
  const [editingModule, setEditingModule] = useState<TodoModule | null>(null)
  const [showNewModule, setShowNewModule] = useState(false)

  function handleDelete(id: string) {
    if (
      confirm(
        '이 모듈을 삭제하시겠습니까?\n해당 모듈이 포함된 프로젝트 유형에서도 제거됩니다.'
      )
    ) {
      dispatch({ type: 'DELETE_MODULE', payload: id })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-700">할일 모듈 관리</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            모듈은 재사용 가능한 할일 묶음입니다. 프로젝트 유형에서 원하는
            모듈을 조합하세요.
          </p>
        </div>
        <button
          onClick={() => setShowNewModule(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shrink-0 ml-4"
        >
          + 모듈 추가
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {state.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onEdit={() => setEditingModule(module)}
            onDelete={() => handleDelete(module.id)}
            onCopy={() => {
              dispatch({
                type: 'ADD_MODULE',
                payload: {
                  name: `${module.name}_복사`,
                  defaultItems: [...module.defaultItems],
                },
              })
            }}
          />
        ))}
        {state.modules.length === 0 && (
          <p className="text-gray-400 text-sm col-span-2 text-center py-8">
            아직 모듈이 없습니다. 모듈을 추가해보세요.
          </p>
        )}
      </div>

      {(showNewModule || editingModule !== null) && (
        <ModuleEditor
          module={editingModule ?? undefined}
          onSave={(data) => {
            if (editingModule) {
              dispatch({
                type: 'UPDATE_MODULE',
                payload: { ...editingModule, ...data },
              })
            } else {
              dispatch({ type: 'ADD_MODULE', payload: data })
            }
            setEditingModule(null)
            setShowNewModule(false)
          }}
          onClose={() => {
            setEditingModule(null)
            setShowNewModule(false)
          }}
        />
      )}
    </div>
  )
}

interface ModuleCardProps {
  module: TodoModule
  onEdit: () => void
  onDelete: () => void
  onCopy: () => void
}

function ModuleCard({ module, onEdit, onDelete, onCopy }: ModuleCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-800">{module.name}</h3>
        <div className="flex gap-2 shrink-0 ml-2">
          <button
            onClick={onCopy}
            className="text-sm text-green-500 hover:text-green-700 font-medium"
          >
            복사
          </button>
          <button
            onClick={onEdit}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-400 hover:text-red-600 font-medium"
          >
            삭제
          </button>
        </div>
      </div>
      <ul className="space-y-1.5">
        {module.defaultItems.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-300 shrink-0">☐</span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-3 text-xs text-gray-400 font-medium">
        총 {module.defaultItems.length}개 항목
      </div>
    </div>
  )
}

interface ModuleEditorProps {
  module?: TodoModule
  onSave: (data: { name: string; defaultItems: string[] }) => void
  onClose: () => void
}

function ModuleEditor({ module, onSave, onClose }: ModuleEditorProps) {
  const [name, setName] = useState(module?.name ?? '')
  const [items, setItems] = useState<string[]>(
    module?.defaultItems.length ? module.defaultItems : ['']
  )

  function addItem() {
    setItems((prev) => [...prev, ''])
  }

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    const filteredItems = items.filter((item) => item.trim())
    if (!name.trim() || filteredItems.length === 0) return
    onSave({ name: name.trim(), defaultItems: filteredItems })
  }

  const canSave = name.trim() && items.some((i) => i.trim())

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">
            {module ? '모듈 수정' : '새 모듈 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              모듈 이름
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 기획, 개발, 테스트..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              기본 할일 항목
            </label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addItem()
                    }}
                    placeholder={`항목 ${i + 1}`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <button
                    onClick={() => removeItem(i)}
                    disabled={items.length <= 1}
                    className="text-gray-300 hover:text-red-400 text-sm px-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="mt-2.5 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              <span>+</span> 항목 추가
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Project Types Settings ───────────────────────────────────────────────────

const PRESET_COLORS = [
  '#0052cc',
  '#00875a',
  '#ff5630',
  '#6554c0',
  '#ff8b00',
  '#00b8d9',
  '#36b37e',
  '#de350b',
]

function ProjectTypesSettings() {
  const { state, dispatch } = useApp()
  const [editingType, setEditingType] = useState<ProjectType | null>(null)
  const [showNew, setShowNew] = useState(false)

  function handleDelete(id: string) {
    if (confirm('이 프로젝트 유형을 삭제하시겠습니까?')) {
      dispatch({ type: 'DELETE_PROJECT_TYPE', payload: id })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-700">프로젝트 유형 관리</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            새 카드를 만들 때 선택할 유형입니다. 각 유형마다 사용할 모듈을
            조합하세요.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shrink-0 ml-4"
        >
          + 유형 추가
        </button>
      </div>

      <div className="grid gap-3">
        {state.projectTypes.map((pt) => {
          const modules = pt.moduleIds
            .map((id) => state.modules.find((m) => m.id === id))
            .filter((m): m is TodoModule => m !== undefined)
          const totalItems = modules.reduce(
            (sum, m) => sum + m.defaultItems.length,
            0
          )

          return (
            <div
              key={pt.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full shrink-0"
                    style={{ backgroundColor: pt.color }}
                  />
                  <h3 className="font-bold text-gray-800">{pt.name}</h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingType(pt)}
                    className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(pt.id)}
                    className="text-sm text-red-400 hover:text-red-600 font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {modules.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {modules.map((m) => (
                    <span
                      key={m.id}
                      className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 font-medium"
                    >
                      {m.name}
                      <span className="text-gray-400 ml-1">
                        ({m.defaultItems.length})
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">사용 중인 모듈 없음</p>
              )}

              <div className="mt-2.5 text-xs text-gray-400 font-medium">
                총 {totalItems}개 할일 자동 생성
              </div>
            </div>
          )
        })}

        {state.projectTypes.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            아직 프로젝트 유형이 없습니다. 유형을 추가해보세요.
          </p>
        )}
      </div>

      {(showNew || editingType !== null) && (
        <ProjectTypeEditor
          projectType={editingType ?? undefined}
          modules={state.modules}
          onSave={(data) => {
            if (editingType) {
              dispatch({
                type: 'UPDATE_PROJECT_TYPE',
                payload: { ...editingType, ...data },
              })
            } else {
              dispatch({ type: 'ADD_PROJECT_TYPE', payload: data })
            }
            setEditingType(null)
            setShowNew(false)
          }}
          onClose={() => {
            setEditingType(null)
            setShowNew(false)
          }}
        />
      )}
    </div>
  )
}

interface ProjectTypeEditorProps {
  projectType?: ProjectType
  modules: TodoModule[]
  onSave: (data: {
    name: string
    color: string
    moduleIds: string[]
  }) => void
  onClose: () => void
}

function ProjectTypeEditor({
  projectType,
  modules,
  onSave,
  onClose,
}: ProjectTypeEditorProps) {
  const [name, setName] = useState(projectType?.name ?? '')
  const [color, setColor] = useState(projectType?.color ?? PRESET_COLORS[0])
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(
    projectType?.moduleIds ?? []
  )

  function toggleModule(id: string) {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  function moveModule(id: string, direction: 'up' | 'down') {
    setSelectedModuleIds((prev) => {
      const index = prev.indexOf(id)
      if (index === -1) return prev
      const arr = [...prev]
      if (direction === 'up' && index > 0) {
        ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      } else if (direction === 'down' && index < arr.length - 1) {
        ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      }
      return arr
    })
  }

  function removeModule(id: string) {
    setSelectedModuleIds((prev) => prev.filter((m) => m !== id))
  }

  function handleSave() {
    if (!name.trim() || selectedModuleIds.length === 0) return
    onSave({ name: name.trim(), color, moduleIds: selectedModuleIds })
  }

  const availableModules = modules.filter(
    (m) => !selectedModuleIds.includes(m.id)
  )
  const canSave = name.trim() && selectedModuleIds.length > 0

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">
            {projectType ? '프로젝트 유형 수정' : '새 프로젝트 유형 추가'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              유형 이름
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 웹 프로젝트, 모바일 앱..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              색상
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${
                    color === c
                      ? 'ring-3 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            {/* Preview */}
            <div className="mt-3 flex items-center gap-2">
              <div
                className="text-xs text-white font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: color }}
              >
                {name || '미리보기'}
              </div>
              <span className="text-xs text-gray-400">카드에 표시될 뱃지</span>
            </div>
          </div>

          {/* Module selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              사용할 모듈
              <span className="text-gray-300 font-normal ml-1">
                (순서를 조정할 수 있습니다)
              </span>
            </label>

            {/* Selected modules (ordered) */}
            {selectedModuleIds.length > 0 && (
              <div className="mb-3 space-y-1.5">
                <div className="text-xs text-gray-400 mb-1.5">
                  선택된 모듈 — 이 순서대로 할일이 생성됩니다
                </div>
                {selectedModuleIds.map((id, i) => {
                  const module = modules.find((m) => m.id === id)
                  if (!module) return null
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2"
                    >
                      <span className="text-xs text-blue-300 font-mono w-5 shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-blue-700">
                        {module.name}
                      </span>
                      <span className="text-xs text-blue-400">
                        {module.defaultItems.length}개
                      </span>
                      <div className="flex gap-1 ml-1">
                        <button
                          onClick={() => moveModule(id, 'up')}
                          disabled={i === 0}
                          className="text-blue-300 hover:text-blue-600 disabled:opacity-25 disabled:cursor-not-allowed text-xs w-5 h-5 flex items-center justify-center rounded transition-colors"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveModule(id, 'down')}
                          disabled={i === selectedModuleIds.length - 1}
                          className="text-blue-300 hover:text-blue-600 disabled:opacity-25 disabled:cursor-not-allowed text-xs w-5 h-5 flex items-center justify-center rounded transition-colors"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeModule(id)}
                          className="text-blue-300 hover:text-red-400 text-xs w-5 h-5 flex items-center justify-center rounded ml-0.5 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Available modules to add */}
            {availableModules.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-xs text-gray-400 mb-1.5">
                  추가할 모듈 선택
                </div>
                {availableModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <span className="text-blue-400 text-sm font-bold">+</span>
                    <span className="flex-1 text-sm font-medium text-gray-600">
                      {module.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {module.defaultItems.length}개
                    </span>
                  </button>
                ))}
              </div>
            ) : modules.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
                먼저 할일 모듈을 추가해주세요.
              </p>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">
                모든 모듈이 선택되었습니다.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
